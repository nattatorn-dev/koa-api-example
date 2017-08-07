'use strict';

const _ = require('lodash');
const uuid = require('uuid/v1');
const validator = require('validator');
const bcrypt = require('bcrypt');
const moment = require('moment');

const logging = require('../middlewares/logging.js');

const subscriberModel = require('../models/subscriber.js');

// Ref: https://stackoverflow.com/a/30835667
function multilineRegExp(regs, options) {
  return new RegExp(regs.map(
    function(reg) {
      return reg.source;
    }
  ).join(''), options);
}

function logAndThrowError(err, msg) {
  LOGGER.error(err, msg);
  throw new Error(msg);
}

/*
   Password rule for validation that requires at least minimum of
   12 characters, 1 uppercase letter, 1 lowercase letter, 1 digit,
   and 1 special character.
*/
const PASSWORD_RULE = multilineRegExp([
  /^(?=.*?[A-Z])/, /(?=.*?[a-z])/, /(?=.*?[0-9])/, /(?=.*?[#?!@$%^&*-])/,
  /.{12,}$/
]);

// Use of logger here is to log database errors and not leak to the top
const LOGGER = logging.getAppLogger();

exports.getSubscribers = async() => {
  try {
    const subscribers = await subscriberModel.getAll();
    return _.defaultTo(subscribers, []);
  } catch (err) {
    logAndThrowError(err, 'Failed to get subscribers!');
  }
};

exports.getSubscriber = async id => {
  if (_.isEmpty(id) || !_.isString(id)) {
    throw new Error('Received an invalid subscriber id!');
  }

  try {
    return _.head(await subscriberModel.get(id));
  } catch (err) {
    logAndThrowError(err, 'Failed to get subscriber!');
  }
};

exports.createSubscriber = async data => {
  if (_.isEmpty(data) || !_.isPlainObject(data)) {
    throw new Error('Received an invalid payload format!');
  }

  if (_.isEmpty(data.name)) {
    throw new Error('Missing subscriber name!');
  }

  const maxNameLength = 120;
  if (data.name.length > maxNameLength ||
    !validator.isAlphanumeric(data.name)) {
    throw new Error(`Name exceeded ${maxNameLength} characters or` +
      ' contains special characters!');
  }

  // The isEmail call has the max length validation of 254 characters.
  if (_.isEmpty(data.email) || !validator.isEmail(data.email)) {
    throw new Error('Missing/Invalid subscriber email address!');
  }

  if (_.isEmpty(data.password) || !_.isString(data.password)) {
    throw new Error('Missing password or password was not a string value!');
  }

  if (_.isNil(data.password.match(PASSWORD_RULE))) {
    throw new Error('Password must be at least 12 characters, contain' +
      ' 1 uppercase and lowercase, 1 digit, and 1 special character.');
  }

  // Passwords need to be hashed and salted before storing.
  const saltRounds = 10;
  /*
     An error will be thrown if we can't hash and salt the password;
     this will prevent creating a subscriber.
  */
  const hashedAndSaltedPassword = await bcrypt.hash(data.password, saltRounds);

  const subscriber = {
    id: uuid(),
    name: data.name,
    email: data.email.toLowerCase(),
    password: hashedAndSaltedPassword,
    created_at: moment.utc().toISOString()
  };

  try {
    return await subscriberModel.create(subscriber);
  } catch (err) {
    logAndThrowError(err, 'Failed to create subscriber!');
  }
};
