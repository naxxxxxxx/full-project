import {client_id, redirect_uri, oauth_path} from "@/utils/constants/feishu";

class feishuSDKClass {
  constructor() {
    this.logable = true;
    this.userAgent = window.navigator.userAgent;
    if (window.h5sdk) {
      window.h5sdk.error(err => this.logger("h5sdk error", JSON.stringify(err)));
    }
  }

  /**
   * 判断是否在飞书客户端内
   * @return {boolean}
   */
  isInClient() {
    console.log("window.navigator.userAgent",window.navigator.userAgent);
    // if (!window.h5sdk) {
    if (window.navigator.userAgent.indexOf("Lark")===-1) {
      return false;
    } else {
      return true;
    }
  }

  /**
   * 飞书登录
   */
  loginBrowser() {
    if (this.isInClient()) {
      // 客户端内免登流程
      window.location.href = redirect_uri;
    } else {
      // 网页使用飞书授权登录
      window.location.href = `${oauth_path}?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&response_type=code&state=login`;
    }
  }

  /**
   * 客户端内免登流程
   */
  loginWithoutCheck(callback) {
    const _this = this;
      _this.logger("loginWithoutCheck");

      window.h5sdk.ready(() => {
        _this.logger("h5sdk ready");
        window.tt.requestAuthCode({
          appId: client_id,
          success(res) {
            _this.logger("h5sdk code", res);
            callback(res.code)
          },
          fail(err) {
            _this.logger("h5sdk code err", err);
            callback();
          }
        })
      })
  }


  /**
   * 打印信息
   * @param {string} target 打印信息
   * @param detail
   */
  logger = (target, detail = "") => {
    this.logable && console.log(`[larkSDK] ${target}`, detail);
  }
}

const larkSDK = new feishuSDKClass();
export default larkSDK;
