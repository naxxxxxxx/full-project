import routes from './config.router';
import theme from './config.theme';
export default {
  treeShaking: true,
  routes,
  theme,
  plugins: [
    [
      'umi-plugin-react',
      {
        antd: true,
        dva: true,
        dynamicImport: { webpackChunkName: true },
        dll: {
          exclude: [
            'koa',
            'koa-bodyparser',
            'koa-convert',
            'koa-json',
            'koa-logger',
            'koa-onerror',
            'koa-router',
            'koa-session',
            'koa-static',
            'koa-views',
            'stylelint',
            'redis',
            'nodemailer',
            'node-schedule'
          ],
        },
        locale: {
          enable: true,
          default: 'zh-CN',
        },
        routes: {
          exclude: [
            /models\//,
            /services\//,
            /model\.(t|j)sx?$/,
            /service\.(t|j)sx?$/,
            /components\//,
          ],
        },
      },
    ],
  ],
};
