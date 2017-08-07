'use strict';

const Koa = require('koa');
const app = new Koa();
const routes = require('koa-route');

app.use(routes.get('/', async ctx => {
  ctx.body = null;
}));

module.exports = app;
