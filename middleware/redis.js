const redis = require('redis');
const conf = require('../config/redis');

class redisUtils {
  constructor() {
    this.connected = false;
    this.client = redis.createClient({
      url: `redis://:${conf.password}@${conf.host}:${conf.port}`,
    });
    this.client.on('error', err => {
      console.log('Redis Error: ' + err);
    });
    this.client.on('connect', () => {
      this.connected = true;
      console.log('Redis conneted');
    });
    this.client.connect();
  }

  /**
   * 获取redis的值
   *
   * @param {string} name redis key
   * @return {Promise<unknown>}
   */
  get = (name) => {
    const _this = this;
    console.log("_this.client", _this.client);
    return new Promise(async (resolve, reject) => {
      await _this.client.get(name).then(result => {
        console.log("result", result)
        if (result){
          resolve(result);
        }
        reject();
      }).catch(reject)
    })
  }

  /**
   * 设置redis
   * @param {string} name redis key
   * @param params
   * @param ttl 过期时间
   * @return {Promise<unknown>}
   */
  set = (name, params, ttl) => {
    const _this = this;
    console.log("_this.client", _this.client);
    return new Promise(async (resolve, reject) => {
      await _this.client.set(name, params).then(result => {
        console.log("result", result)
        _this.client.expire(name, ttl || conf.ttl);
        resolve(result);
      }).catch(reject)
    })
  }
}

const redisUtil = new redisUtils();
module.exports = redisUtil;
