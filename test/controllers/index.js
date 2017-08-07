'use strict';

const request = require('supertest');

const app = require('../../app.js');

describe('GET /', () => {
  const uri = '/';

  it('should get successful response', done => {
    request(app)
      .get(uri)
      .expect(204)
      .end(done);
  });
});
