'use strict';

const request = require('supertest');
const sinon = require('sinon');

const servicePath = '../../apis/services';
const subscriberService = require(`${servicePath}/subscribers.js`);

const app = require('../../app.js');

describe('GET /subscribers', () => {
  const uri = '/subscribers';
  let serviceStub;

  beforeEach(() => serviceStub = sinon.stub(subscriberService,
    'getSubscribers'));
  afterEach(() => serviceStub.restore());

  it('should get subscribers', done => {
    const expected = [{
      id: 'f62b77c1-52f8-4c6b-9f2c-bca552e5b09b',
      name: 'John'
    }];
    serviceStub.returns(Promise.resolve(expected));
    request(app)
      .get(uri)
      .expect(200)
      .expect(expected)
      .end(done);
  });

  it('should get no subscribers', done => {
    const expected = [];
    serviceStub.returns(Promise.resolve(expected));
    request(app)
      .get(uri)
      .expect(200)
      .expect(expected)
      .end(done);
  });

  it('should fail to get subscribers', done => {
    serviceStub.throws(new Error('Failed to get subscribers'));
    request(app)
      .get(uri)
      .expect(500)
      .end(done);
  });
});

describe('POST /subscribers', () => {
  const uri = '/subscribers';
  let serviceStub;
  const payload = {
    name: 'John',
    email: 'john.doe@foobar.com',
    password: '$ooDL3z10dx501'
  };

  beforeEach(() => serviceStub = sinon.stub(subscriberService,
    'createSubscriber'));
  afterEach(() => serviceStub.restore());

  it('should create a subscriber', done => {
    serviceStub.returns(Promise.resolve());
    request(app)
      .post(uri)
      .send(payload)
      .expect(204)
      .end(done);
  });

  it('should fail to create a subscriber', done => {
    serviceStub.throws(new Error('Failed to create subscriber'));
    request(app)
      .post(uri)
      .send(payload)
      .expect(500)
      .end(done);
  });
});

describe('GET /subscribers/:id', () => {
  const id = '9cf5186c-0276-4af1-9efb-8d0e5fbc922b';
  const uri = `/subscribers/${id}`;
  let serviceStub;

  beforeEach(() => serviceStub = sinon.stub(subscriberService,
    'getSubscriber'));
  afterEach(() => serviceStub.restore());

  it('should get subscriber', done => {
    const expected = {
      id: id,
      name: 'Jane'
    };
    serviceStub.returns(Promise.resolve(expected));
    request(app)
      .get(uri)
      .expect(200)
      .expect(expected)
      .end(done);
  });

  it('should get no subscriber', done => {
    serviceStub.returns(Promise.resolve());
    request(app)
      .get(uri)
      .expect(204)
      .end(done);
  });

  it('should fail to get subscriber', done => {
    serviceStub.throws(new Error('Failed to get subscriber'));
    request(app)
      .get(uri)
      .expect(500)
      .end(done);
  });
});
