const md5 = require('md5');
const STATUS = require('../config/status');
const { AesEnToJava} = require('../middleware/utils');
const messageApi = require('./message');
// 表实例
const UserDao = require('../middleware/dao/user');
const userDao = new UserDao();

const user = {
  // 用户登录
  login: async ctx => {
    const {body: {username: incomeUserName, password: incomePwd}} = ctx.request;
    return new Promise(async (resolve, reject) => {
      if (!incomeUserName || !incomePwd) {
        reject(STATUS.paramsError());
      } else {
        const phoneReg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
        let email;
        let phone;
        if (phoneReg.test(incomeUserName)) {
          phone = incomeUserName;
        } else {
          email = incomeUserName;
        }
        // 查询一个用户
        await userDao.userLogin({email, phone}).then(async data => {
          if (!data) {
            reject(STATUS.paramsError("账号密码错误"));
          } else {
            const final = {...data, id: AesEnToJava(`${data.user_id}`)}
            if (data.status === 0) {
              resolve(STATUS.success(final));
            } else {
              if (incomePwd && md5(incomePwd) === data.password) {
                await userDao.loginRecord(email ? 2 : 1, data.user_id, email || phone).then().catch();

                ctx.session.user = final;
                resolve(STATUS.success(final));
              } else {
                reject(STATUS.paramsError("账号密码错误"));
              }
            }
          }
        }).catch(err => {
          reject(STATUS.serverError());
        });
      }
    });
  },
};
module.exports = user;
