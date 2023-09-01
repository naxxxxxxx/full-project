const router = require('koa-router')();
const STATUS = require('../config/status');
const apis = {
  user: require('../api/user'),
};

router.prefix('/api');

router.get('*', function (ctx, next) {
  ctx.body = {
    status: 0,
    statusText: 'error',
  };
});

router.post('*', async (ctx, next) => {
  const pathArr = ctx.request.path.split('/');
  const moduleName = pathArr[2];
  const apiName = pathArr[3];
  const user = ctx.session.user;
  if (!user && apiName !== 'login') {
    return (ctx.body = STATUS.unSigned());
  } else {
    if (pathArr.length !== 4) {
      return (ctx.body = STATUS.notFound());
    } else {
      await apis[moduleName][apiName](ctx, next)
        .then(res => (ctx.body = res))
        .catch(err => (ctx.body = err));
    }
  }
});

module.exports = router;
