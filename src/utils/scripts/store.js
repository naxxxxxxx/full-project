import Notify from "@/utils/scripts/notification";


/**
 * 处理本地数据
 */
export default class StoreOperator {
  constructor() {
    this.store = window.g_app._store;
    this.value = null;
    this.modelName = null;
    this.stateName = null;
    this.fieldName = null;
  }

  message = ({title, icon}, onClick) => {
    return Notify(title, {
      icon,
    }, onClick)
  }

  //消息提醒点击已读
  clickNotify = (message_id, comid) => {
    if (message_id) {
      this.store.dispatch({
        type: 'message/read',
        payload: {
          message_id,
        }
      })
    }
  }

  /**
   * 获取model数据
   * @param {string} modelName 模块名
   * @return {any}
   */
  model = (modelName) => {
    const currentState = this.store.getState();
    this.modelName = modelName;
    this.value = currentState[modelName];
    this.logger("value", this.value);
    return this;
  }

  /**
   * 获取状态数据
   * @param {string} stateName 状态名
   * @return {any}
   */
  state = (stateName) => {
    this.stateName = stateName;
    this.value = this.value[stateName];
    this.logger("value", this.value);
    return this;
  }

  /**
   * 获取字段数据
   * @param {string} fieldName 字段名
   * @return {any}
   */
  field = (fieldName) => {
    this.fieldName = fieldName;
    this.value = this.value[fieldName];
    this.logger("value", this.value);
    // this.store[this.modelName][this.stateName][this.fieldName] = null;
    return this;
  }

  modify = (modify) => {
    this.logger("modify:", modify);
    let res = true;
    modify.map(({store, dispatch}) => {
      const {key, value} = store;
      const names = key.split('-');
      let current = this.store.getState();
      for (let i = 0; i < names.length; i++) {
        current = current && current[names[i]] ? current[names[i]] : null;
      }

      if (current && current === value) {
        if (dispatch) {
          this.dispatch({
            ...dispatch
          })
        }
      } else {
        res = false;
      }
    })
    return res;
  }

  /**
   * 修改store里的数据
   */
  dispatch = ({type, payload}) => {
    this.store.dispatch({type, payload})
    // this.logger("this.store", window.g_app._store);
    // this.logger("this.app", window.g_app)

  }

  /**
   * 修改store里的数据
   */
  refreshMsg = (comid) => {
    const unReadCnt = this.store.getState()['message']['unReadCnt'];
    this.store.getState()['message']['unReadCnt'] = unReadCnt + 1;
    const msgList = this.store.getState()['message']['list'];
    if (msgList) {
      setTimeout(() => {
        this.dispatch({
          type: 'message/list',
          payload: {comid}
        });
      }, 1000);
    }
    setTimeout(() => {
      this.dispatch({
        type: 'message/unReadCnt',
        payload: {comid}
      });
    }, 1000)
  }

  /**
   * Store打印信息
   * @param {string} target 打印信息
   * @param detail
   */
  logger = (target, detail = "") => {
    console.log(`[Store] ${target}`, detail)
  }

  operationType = ({type, data}) => {
    this.logger("g_app_store", window.g_app._store.getState());
  }

}
