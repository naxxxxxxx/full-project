import request from '@/utils/scripts/request';

/****************** USER START ********************/
export async function login(params) {
  return request('/api/user/login', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

/****************** USER END ********************/
