const feishu = {
  // 飞书应用ID
  app_id: '',
  // 飞书测试应用ID
  test_app_id: '',
  // 飞书应用密钥
  app_secret: '',
  // 飞书测试应用密钥
  test_app_secret: '',
  // 事件订阅验证token
  verification_token: "",
  // 开放平台接口域名
  domain: "https://open.feishu.cn",
  // 接口协议地址
  protocols: {
    tenant: {
      access_token: "/open-apis/auth/v3/tenant_access_token/internal", // 租户访问凭证
    },
    app: {
      access_token: "/open-apis/auth/v3/app_access_token/internal", // 应用访问凭证
    },
    user: {
      access_token: "/open-apis/authen/v1/access_token", // 用户访问凭证
      refresh_access_token: "/open-apis/authen/v1/refresh_access_token", // 刷新用户访问凭证
    },
    message: {
      send: "/open-apis/im/v1/messages", // 发送消息接口
    },
    // 网页版oauth
    passport: {
      domain: "https://passport.feishu.cn",
      oauthToken: "/suite/passport/oauth/token",
      oauthUserInfo: "/suite/passport/oauth/userinfo"
    },
  },
};

module.exports = feishu;
