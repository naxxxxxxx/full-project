const status = {
  SUCCESS: 200,
  UNKNOWNERROR: -101,
  NOTFOUND: 404,
  UNSIGNED: 508,
  SERVERERROR: 601,
  PARAMSERROR: 602,
  NOAUTH: 603,
  FORBIDDEN: 403,
};

const statusText = {
  SUCCESS: '成功',
  UNKNOWNERROR: '未知错误',
  NOTFOUND: '请求的资源不存在或不可用',
  UNSIGNED: '您还未登录或登录信息已过期，请重新登录',
  SERVERERROR: '服务异常',
  PARAMSERROR: '参数错误，请检查您的参数',
  NOAUTH: '没有权限访问',
  FORBIDDEN: '没有权限请求此操作',
};

const success = (data) => {
  return {
    status: status.SUCCESS,
    statusText: statusText.SUCCESS,
    data
  }
}
const unknownError = (text) => {
  return {
    status: status.UNKNOWNERROR,
    statusText: text || statusText.UNKNOWNERROR,
  }
}
const notFound = (text) => {
  return {
    status: status.NOTFOUND,
    statusText: text || statusText.NOTFOUND,
  }
}
const unSigned = (text) => {
  return {
    status: status.UNSIGNED,
    statusText: text || statusText.UNSIGNED,
  }
}
const serverError = (text) => {
  return {
    status: status.SERVERERROR,
    statusText: text || statusText.SERVERERROR,
  }
}
const paramsError = (text) => {
  return {
    status: status.PARAMSERROR,
    statusText: text || statusText.PARAMSERROR,
  }
}
const noAuth  = (text) => {
  return {
    status: status.NOAUTH,
    statusText: text || statusText.NOAUTH,
  }
}
const forbidden = (text) => {
  return {
    status: status.FORBIDDEN,
    statusText: text || statusText.FORBIDDEN,
  }
}

module.exports = {
  status,
  statusText,
  success,
  unknownError,
  notFound,
  unSigned,
  serverError,
  paramsError,
  noAuth,
  forbidden
};
