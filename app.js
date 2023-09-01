const Koa = require('koa');
const fs = require('fs');
const moment = require('moment');
const path = require('path');
const views = require('koa-views');
const json = require('koa-json');
const onerror = require('koa-onerror');
const session = require('koa-session');
const logger = require('koa-logger');
const cors = require('koa2-cors');
const koaBody = require('koa-body');

const index = require('./routes/index');
const api = require('./routes/api');

const app = new Koa();
// error handler
onerror(app);
app.keys = ['task-flow-server'];
// session配置
const sessions = {
  key: 'koa:sess',
  maxAge: 15 * 24 * 3600 * 1000,
  overwrite: true,
  httpOnly: true,
  signed: true,
  rolling: false,
  renew: false,
};
// 中间件
// configure session
app.use(session(sessions, app));
// 允许跨域,注释则不允许跨域
app.use(
  cors({
    credentials: true,
    allowMethods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept', "x-requested-with"],
  }),
);
// 请求体格式
app.use(
  koaBody({
    multipart: true,
    formidable: {
      maxFileSize: 500 * 1024 * 1024, // 设置上传文件大小最大限制，50M
      uploadDir: path.join(__dirname, 'public/uploads/'),
      keepExtensions: true,
    },
  }),
);
app.use(json());
app.use(logger());
app.use(require('koa-static')(__dirname + '/public'));

app.use(
  views(__dirname + '/views', {
    extension: 'pug',
  }),
);

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// routes
app.use(api.routes(), api.allowedMethods());
app.use(index.routes(), index.allowedMethods());

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx);
});

module.exports = app;
