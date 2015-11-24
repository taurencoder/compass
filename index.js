const Koa = require('koa');
const app = new Koa();
const log = require('./utils/log');
const convert = require('koa-convert');
const bodyparser = require('koa-body');

app.use(convert(bodyparser({multipart: true})));
app.use(convert(log.middleware(log.logger, {level: 'auto'})));

app.use(ctx => {
  ctx.body = 'test';
});

module.exports = app;
