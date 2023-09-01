import {fetch} from 'dva';
import {notification} from 'antd';
import router from 'umi/router';
import {getStorage} from '@/utils/scripts/tools';

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  501: '未知错误',
  502: '网关错误。参数异常。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
  505: '服务错误',
  506: '请求超时',
  507: '签名错误',
  508: '您还未登录或登录失效',
  509: '您没有该权限',
};

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const errortext = codeMessage[response.status] || response.statusText;
  notification.error({
    // message: `请求错误 ${response.status}: ${response.url}`,
    message: `请求错误 ${response.status}`,
    description: errortext,
  });
  const error = new Error(errortext);
  error.name = response.status;
  error.response = response;
  throw error;
}

export default function request(url, options) {
  let finalUrl =
    window.location.href.indexOf('localhost') > -1 ? `http://localhost:3000${url}` : url;
  const defaultOpts = {
    credentials: 'include',
  };
  const finalOpts = {...defaultOpts, ...options};

  // eslint-disable-next-line prefer-destructuring
  const file = finalOpts.body.file;

  if (file === 'excel') {
    finalOpts.responseType = 'application/vnd.ms-excel';
  }

  if (!(finalOpts.body instanceof FormData)) {
    finalOpts.headers = {
      ...finalOpts.headers,
      Accept: 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
    };
    if(window.imToken) finalOpts.body["IM-TK"] = window.imToken;
    finalOpts.body = JSON.stringify(finalOpts.body);
  } else {
    // finalOpts.body is FormData
    finalOpts.headers = {
      ...finalOpts.headers,
      Accept: 'application/json',
    };
  }

  return fetch(finalUrl, finalOpts)
    .then(checkStatus)
    .then(response => {
      if (finalOpts.method === 'DELETE' || response.status === 204) {
        return response.text();
      }
      if (file === 'excel') {
        response.arrayBuffer().then(result => {
          const blob = new Blob([result], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          const objectUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          const data = JSON.parse(finalOpts.body);
          const fileName = data.fileName
            ? `${data.fileName}${new Date().getTime()}`
            : `${new Date().getTime()}`;
          a.download = `${fileName}.xlsx`;
          document.body.appendChild(a);
          a.style = 'display: none';
          a.href = objectUrl;
          a.click();
          URL.revokeObjectURL(a.href);
          document.body.removeChild(a);
        });
      } else {
        return response.json().then(data => {
          if (data.status === 508 && window.location.pathname !== "/") {
            notification.error({
              message: '登录信息失效或未登录',
              description: '您的登录信息已失效或您还未登录账号，请先登录账号。',
              duration: 2,
            });
            router.push('/user/login');
            return {
              status: 508,
              statusText: '没有登录',
            };
          } else {
            return data;
          }
        });
      }
    })
    .catch(e => {
      const status = e.name;
      if (status === 508 && window.location.pathname !== "/") {
        window.location.href = '/user/login';
      }
    });
}
