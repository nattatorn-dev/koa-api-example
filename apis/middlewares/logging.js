'use strict';

const bunyan = require('bunyan');
const logger = require('koa-bunyan-logger');

const APP_LOGGER = bunyan.createLogger({
  name: 'koa-api',
  level: 'info',
  serializers: bunyan.stdSerializers
});

exports.getAppLogger = () => APP_LOGGER;
exports.getKoaLogger = () => logger(APP_LOGGER);
exports.getRequestLogger = () => logger.requestLogger();
