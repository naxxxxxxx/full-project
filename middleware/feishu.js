const lark = require('@larksuiteoapi/node-sdk');
const feishu = require("../config/config.feishu");
const redis = require("../middleware/redis");

class FeishuUtils {
  constructor() {

    this.client = new lark.Client({
      appId: feishu.app_id,
      appSecret: feishu.app_secret,
      disableTokenCache: true
    });

    this.keys = {
      access_token: "feishuAccessToken", // access_token redis key
      app_access_token: "feishuAppAccessToken", // app_access_token redis key
      tenant_access_token: "feishuTenantAccessToken", // app_access_token redis key
    }
  }

  /**
   * WEB-浏览器通过授权code获取accessToken
   * https://open.feishu.cn/document/common-capabilities/sso/api/get-access_token
   *
   * @param {object} params 参数：code && redirect_uri
   * @return {Promise<unknown>}
   */
  async getAccessToken(params) {
    const _this = this;
    return new Promise(async (resolve, reject) => {
      await this.client.request({
        url: `${feishu.protocols.passport.domain}${feishu.protocols.passport.oauthToken}`,
        method: "POST",
        data: {
          grant_type: "authorization_code",
          client_id: feishu.app_id,
          client_secret: feishu.app_secret,
          ...params
        }
      }).then(async result => {
        if (result) {
          resolve(result);
        } else {
          reject()
        }
      }).catch(reject)
    })
  }


  /**
   * 获取自建应用的 tenant_access_token
   *
   * @return {Promise<unknown>}
   */
  async getTenantAccessToken() {
    const _this = this;
    return new Promise(async (resolve, reject) => {
      await redis.get(_this.keys.tenant_access_token).then(tenant_access_token => {
        resolve({tenant_access_token});
      }).catch(async () => {
        await this.client.request({
          url: `${feishu.domain}${feishu.protocols.tenant.access_token}`,
          method: "POST",
          data: {
            app_id: feishu.app_id,
            app_secret: feishu.app_secret,
          }
        }).then(async result => {
          console.log("TenantAccessToken result", result);
          const {tenant_access_token, code} = result;
          if (code === 0) {
            await redis.set(_this.keys.tenant_access_token, tenant_access_token, result.expires_in - 60).catch(err => {
              console.log("set redis error", err);
            });
            resolve(result);
          } else {
            reject()
          }
        }).catch(reject);
      });

    })
  }

  /**
   * 获取自建应用的 app_access_token
   *
   * @return {Promise<unknown>}
   */
  async getAppAccessToken() {
    const _this = this;
    return new Promise(async (resolve, reject) => {
      await redis.get(_this.keys.app_access_token).then(app_access_token => {
        resolve({app_access_token});
      }).catch(async () => {
        await this.client.request({
          url: `${feishu.domain}${feishu.protocols.app.access_token}`,
          method: "POST",
          data: {
            app_id: feishu.app_id,
            app_secret: feishu.app_secret,
          }
        }).then(async result => {
          console.log("AppAccessToken result", result);
          const {app_access_token, code} = result;
          if (code === 0) {
            await redis.set(_this.keys.app_access_token, app_access_token, result.expires_in - 60).catch(err => {
              console.log("set redis error", err);
            });
            resolve(result);
          } else {
            reject()
          }
        }).catch(reject);
      });

    })
  }

  /**
   * 使用app_access_token和预授权code进行用户信息获取
   *
   * @param app_access_token
   * @param code
   * @return {Promise<unknown>}
   */
  async getUserAccessTokenWithAppAccessTokenAndCode(app_access_token, code) {
    return new Promise(async (resolve, reject) => {
      await this.client.request({
        url: `${feishu.domain}${feishu.protocols.user.access_token}`,
        method: "POST",
        data: {
          grant_type: "authorization_code",
          code
        },
        headers: {
          Authorization: `Bearer ${app_access_token}`
        }
      }).then(result => {
        const {code, data} = result;
        if (code === 0) {
          resolve(data);
        } else {
          reject();
        }
      }).catch(reject);
    })
  }

  /**
   * 通过access_token获取飞书用户信息
   * https://open.feishu.cn/document/common-capabilities/sso/api/get-user-info
   *
   * @param access_token
   * @return {Promise<unknown>}
   */
  async getUserInfoWithAccessToken(access_token) {
    return new Promise(async (resolve, reject) => {
      await this.client.request({
        url: `${feishu.protocols.passport.domain}${feishu.protocols.passport.oauthUserInfo}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      }).then(result => {
        console.log("user info", result);
        resolve(result);
      }).catch(reject);
    })
  }

  /**
   * 发送机器人消息
   * https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create
   *
   * @param tenant_access_token
   * @param receive_id_type
   * @param data
   * @return {Promise<unknown>}
   */
  async sendMessageWithAccessToken(receive_id_type, data) {
    return new Promise(async (resolve, reject) => {
      await this.getTenantAccessToken().then(async ({tenant_access_token})=>{
        await this.client.request({
          url: `${feishu.domain}${feishu.protocols.message.send}`,
          method: "POST",
          headers: {
            Authorization: `Bearer ${tenant_access_token}`
          },
          params: {
            receive_id_type
          },
          data
        }).then(result => {
          const {code} = result;
          if (code === 0) {
            resolve(result.data);
          } else {
            reject();
          }
        }).catch(reject);
      }).catch(reject);
    })
  }


}

module.exports = FeishuUtils;
