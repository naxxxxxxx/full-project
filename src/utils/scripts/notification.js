/**
 * 通知接口
 * @param {string} title 通知标题
 * @param body 通知内容
 * @param icon 显示图标
 * @param data 通知的数据 {type: "openFileViewer", data: "file url"}|{type: "openTask", data: "task id"}|{type: "openUrl", data: "url"}
 * @param onClick 点击通知回调
 * @param onClose 关闭通知回调
 * @param onError 通知错误回调
 * @constructor
 */
const Notify = (title, {body = "点击查看详情", icon = "https://static.yezixigame.com/resources/images/ifunworks/icon-black-white-radius.png", data = null}, onClick, onClose, onError) => {
  Notification.requestPermission().then(permission => {
    // 浏览器已获得权限直接通知，否则不通知
    if (permission === "granted") {
      const notify = new Notification(title, {body, icon, data});
      notify.onclick = (({currentTarget}) => {
        window.focus();
        const {data: currentData} = currentTarget;
        if (currentData) {
          const {type, data} = currentData;
          switch (type) {
            case "openFileViewer":
              // TODO 打开文件预览弹窗
              break;
            case "openTask":
              // TODO 打开任务详情页
              break;
            case "openUrl":
              // 打开地址
              try {
                window.open(data);
              } catch (err) {
                console.log("打开地址错误", err)
              }
              break;
            default:
              break;
          }
        }
        // 传入了回调，执行
        onClick && onClick();
      })
      notify.onclose = (e) => onClose ? onClose(e) : {};
      notify.onerror = (e) => onError ? onError(e) : {};
    }
  }).catch(err => {
  })
};

export default Notify;
