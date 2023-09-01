const Wrapper = require('../wrapper');
const DbBase = require('../dbbase');
const {tableName} = require('../../config/dbname');
const moment = require('moment');
const {dateFormat} = require('../../config/constants');
const {AesDeToJava, AesEnToJava, RandomStr} = require('../utils');

class UserDao extends DbBase {
  constructor() {
    super();
    this.tableName = tableName.user;
  }

  /**
   * 登录接口， 获取用户信息
   * @param key
   * @param value
   * @returns {Promise<void>}
   */
  async userLogin({user_id, email, phone}) {
    return new Promise(async (resolve, reject) => {
      const selector = new Wrapper(this.tableName);
      selector.select(
        'a.user_id,a.account,a.password,a.nick_name,a.phone,a.email,a.type,a.status',
        'b.gender,b.remark,b.avatar,b.birth,b.address'
      )
        .from(`${tableName.user} a`)
        .join('LEFT', `${tableName.user_info} b`, 'a.user_id=b.user_id');
      if (user_id) {
        selector.eq('a.user_id', user_id);
      } else if (email) {
        selector.eq('a.email', email);
      } else if (phone) {
        selector.eq('a.phone', phone);
      }
      selector.ge('a.status', '0');
      await super.selectOne(selector).then(result => {
        resolve(result)
      }).catch(err => reject(err));
    });
  }

}

module.exports = UserDao;
