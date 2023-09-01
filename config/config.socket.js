// socket基本参数
const socket = {
  domain: "",
  appid: "",
  pf: "",
  key: "",
};

// socket协议地址
const protocols = {
  login: "/auth/user_token",
  send: "/message/send",
  create_list_user: "/user/add_group_user",
  remove_list_user: "/user/del_group_user",
  history: "/message/history",
};

module.exports = {socket, protocols};
