'use strict';

const Koa = require('koa');
const mount = require('koa-mount');
const routes = require('koa-route');
const json = require('koa-json');
const error = require('koa-json-error');
const bodyParser = require('koa-bodyparser');
const _ = require('lodash');

const logging = require('./apis/middlewares/logging.js');

const app = new Koa();
const env = process.env.NODE_ENV;

// Turns on request/response logging
if (env !== 'test') {
  app.use(logging.getKoaLogger());
  app.use(logging.getRequestLogger());
}

// Middleware for parsing a request body
app.use(bodyParser());

// Sets content type of responses to JSON
// Passing pretty query param to URLs will pretty print JSON
app.use(json({
  pretty: false,
  param: 'pretty'
}));

const options = {
  // Avoid showing the stacktrace in 'production' env
  postFormat: (e, obj) => env === 'production' ?
    _.omit(obj, 'stack') : obj
};
app.use(error(options));

const controllersPath = './apis/controllers';
app.use(mount('/', require(`${controllersPath}/index.js`)));
app.use(mount('/subscribers', require(`${controllersPath}/subscribers.js`)));

const listener = app.listen(process.env.PORT);

// Used for testing
module.exports = listener;
