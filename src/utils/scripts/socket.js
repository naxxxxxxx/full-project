/**
 * Socket控制器
 */
import StoreOperator from "@/utils/scripts/store";
import {connect} from 'dva'
import {Form} from "antd";
import {clearStorage, getLocalComID, getStorage, setStorage, toMainPage} from "@/utils/scripts/tools";
import router from "umi/router";

export default class GlobalSocket {
  /**
   * 创建socket管理
   * @param {string} socketURL socket地址
   * @param {string} token socket返回的token
   */
  constructor(socketURL, token) {
    this.logger("开始初始化");
    this.socket = null; // socket对象
    this.authorization = false; // 是否已经验证
    this.url = socketURL; // socket连接地址
    this.token = token;
    this.interval = null; // 保活定时器
    this.aliveDuration = 3000; // 保活间隔
    this.logable = false;
    this.initSocket();
  }

  /**
   * 初始化socket
   */
  initSocket = () => {
    const _this = this;
    if (!this.socket) {
      this.socket = new WebSocket(`${_this.url}?token=${_this.token}`);
      this.socket.onopen = function () {
        _this.logger("连接成功");
        _this.keepSocketAlive();
        // _this.sendMessage({
        //   type: "auth",
        //   token: _this.token
        // });
      };
      this.socket.onclose = this.onSocketClose;
      this.socket.onmessage = this.onSocketReceiveMessage;
      this.socket.onerror = this.onSocketError;
      this.socket.addEventListener("error", this.onSocketError);
    }
  }

  /**
   * 发送socket消息
   * @param {object} message 消息
   */
  sendMessage = (message = {}) => {
    this.logger("发送消息", message);
    if (message && message.type) {
      this.socket && this.socket.send(JSON.stringify(message));
    }
  }

  /**
   * socket异常
   * @param err
   */
  onSocketClose = (event) => {
    this.logger("异常关闭, error:", event);

    // 清空旧socket
    this.destroy();

    // 重新连接socket
    this.initSocket();
  }
  /**
   * socket异常
   * @param err
   */
  onSocketError = (event) => {
    this.logger("异常报错, error:", event);
  }

  /**
   * socket接收到消息
   * @param message
   */
  onSocketReceiveMessage = (message) => {
    const {data: result} = message;
    const finalMessage = JSON.parse(result);
    const {code, data: resultData} = finalMessage;
    this.logger("接收到的消息", finalMessage || "");
    if (code === 200) {
      switch (resultData.type) {
        case "auth":
          // this.authorization = true;
          // this.keepSocketAlive();
          break;
        case "normal":
          const opt = new StoreOperator();
          const body = JSON.parse(resultData.body);
          let refreshed = false;
          if (body.modify && body.modify.length>0){
            refreshed = opt.modify(body.modify);
          }
          if (body.message_id){
            if (body.msgType==='System' || (getLocalComID() && (body.msgType==='Company' || body.comid ===getLocalComID()))) {
              opt.message(body, () => {
                opt.clickNotify(body.message_id)

                if (getLocalComID() && body.comid !==getLocalComID()){
                  clearStorage('current_com_id')
                  toMainPage();
                }else {
                  if (!refreshed && body.link) {
                    const {path, type} = body.link;
                    if (type === 'toUrl') {
                      router.push(path);
                    }
                    if (type === 'openUrl') {
                      window.open(path);
                    }
                  }
                }

              });
            }
            if (body.msgType==='System' || (getLocalComID() && body.comid ===getLocalComID())){
              opt.refreshMsg(getLocalComID());
            }
          }

          // const opt =  new StoreOperator(resultData.data);
          // connect(({project, selection, loading}) => ({
          //   project,
          //   selection,
          // }))(opt);
          break;
        case "event":
          break;
        case "pong":
          // new StoreOperator().dispatch({type: "task/list", payload: {a: 1}})
          break;
        default:
          break;
      }
    }
  }

  /**
   * socket保活
   */
  keepSocketAlive = () => {
    const _this = this;
    if (!_this.interval) {
      this.interval = window.setInterval(() => {
        this.sendMessage({type: "ping", token: _this.token});
      }, _this.aliveDuration);
    }
  }


  /**
   * Socket打印信息
   * @param {string} target 打印信息
   * @param detail
   */
  logger = (target, detail = "") => {
    this.logable && console.log(`[Socket] ${target}`, detail);
  }

  /**
   * 清空socket
   */
  destroy = () => {
    if (!this.socket) {
      this.socket = null;
      this.authorization = null;
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
    }
  }

}
