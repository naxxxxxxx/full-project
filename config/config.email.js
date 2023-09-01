module.exports = {
  defaultTransporter: {
    host: 'qiye.163.com', // 发送邮件服务器
    port: 587, // 发送邮件端口
    secure: false, // 是否加密
    auth: {
      user: 'a@abc.com', // 发送邮件帐号
      pass: 'aaaaaaa' // 发送邮件密码
    },
  },
  defaultOptions: {
    from: '"aver" <a@abc.com>', // 默认设置，
  }
}
