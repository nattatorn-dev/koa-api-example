'use strict';

const db = require('./db.js');

exports.getAll = () => {
  return db.knex('subscriber')
    .select('id', 'name');
};

exports.get = id => {
  return db.knex('subscriber')
    .where('id', id)
    .select('id', 'name');
};

exports.create = subscriber => {
  return db.knex('subscriber').insert(subscriber);
};
