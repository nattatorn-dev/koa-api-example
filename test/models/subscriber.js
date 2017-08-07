'use strict';

const sinon = require('sinon');
const assert = sinon.assert;

const modelPath = '../../apis/models';
const db = require(`${modelPath}/db.js`);
const model = require(`${modelPath}/subscriber.js`);

function mockDB() {
  const dbMock = sinon.spy(() => dbMock);
  const wrappedPromise = sinon.spy(() => Promise.resolve(dbMock));

  const mockMethods = {
    select: wrappedPromise,
    where: dbMock,
    insert: wrappedPromise
  };

  return Object.assign(dbMock, mockMethods);
}

const TABLE = 'subscriber';

describe('getAll', () => {
  const dbMock = mockDB();
  before(() => db.knex = dbMock);

  it('should get all subscribers', async() => {
    await model.getAll();
    assert.calledWith(dbMock, TABLE);
    assert.calledWith(dbMock.select, 'id', 'name');
  });
});

describe('get', () => {
  const id = 'c7949d80-0e85-441d-bbff-ad76a371b68e';
  const dbMock = mockDB();
  before(() => db.knex = dbMock);

  it('should get the subscriber by id', async() => {
    await model.get(id);
    assert.calledWith(dbMock, TABLE);
    assert.calledWith(dbMock.where, 'id', id);
    assert.calledWith(dbMock.select, 'id', 'name');
  });
});

describe('create', () => {
  const subscriber = {
    id: 'c35a8a79-1bf5-437e-86b6-394cfa8b65b3',
    name: 'John',
    email: 'john.doe@foobar.com',
    password: '$2a$10$Og2BD7/rDbcn5rrBj2sJW.AgTP9ppQ.j4FRv80OHJGQiFhWtpWO9e',
    created_at: '2017-08-04T09:11:23.533Z'
  };
  const dbMock = mockDB();
  before(() => db.knex = dbMock);

  it('should create a subscriber', async() => {
    await model.create(subscriber);
    assert.calledWith(dbMock, TABLE);
    assert.calledWith(dbMock.insert, subscriber);
  });
});
