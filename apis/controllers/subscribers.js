'use strict';

const Koa = require('koa');
const app = new Koa();
const routes = require('koa-route');

const subscriberService = require('../services/subscribers.js');

/*
   Logged in subscribers can see other subscribers if they want since
   no sensitive information is being retrieved.
*/
app.use(routes.get('/', async ctx => {
  ctx.body = await subscriberService.getSubscribers();
}));

/*
   In a real use case scenario, you probably wouldn't want to allow
   subscribers to create other subscribers.
*/
app.use(routes.post('/', async ctx => {
  await subscriberService.createSubscriber(ctx.request.body);
  ctx.body = null;
}));

app.use(routes.get('/:id', async(ctx, id) => {
  ctx.body = await subscriberService.getSubscriber(id);
}));

module.exports = app;
