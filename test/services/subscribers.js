'use strict';

const bcrypt = require('bcrypt');
const sinon = require('sinon');
const assert = sinon.assert;

const apiPath = '../../apis';
const modelPath = `${apiPath}/models`;

const subscriberModel = require(`${modelPath}/subscriber.js`);

const service = require(`${apiPath}/services/subscribers.js`);

describe('getSubscribers', () => {
  let subscriberModelStub;

  beforeEach(() => subscriberModelStub = sinon.stub(subscriberModel, 'getAll'));
  afterEach(() => subscriberModelStub.restore());

  it('should get subscribers', async() => {
    const expected = [{
      id: '2a8ae915-aaa1-424b-8131-76b39e70b516',
      name: 'John'
    }, {
      id: 'a17198ec-31d5-4829-ba65-8ddf6813cb0d',
      name: 'Jane'
    }];
    subscriberModelStub.returns(Promise.resolve(expected));

    const subscribers = await service.getSubscribers();
    assert.match(subscribers, expected);
  });

  it('should get no subscribers', async() => {
    const expected = [];
    subscriberModelStub.returns(Promise.resolve(expected));

    const subscribers = await service.getSubscribers();
    assert.match(subscribers, expected);
  });

  it('should fail to get subscribers', async() => {
    const expected = new Error('Failed to get subscribers!');
    subscriberModelStub.throws(expected);
    try {
      await service.getSubscribers();
    } catch (err) {
      assert.match(err.message, expected.message);
    }
  });
});

describe('getSubscriber', () => {
  const id = '1715e632-9bbf-4d29-97bf-deda5a29d12b';
  let subscriberModelStub;

  beforeEach(() => subscriberModelStub = sinon.stub(subscriberModel, 'get'));
  afterEach(() => subscriberModelStub.restore());

  async function assertGetSubscriberError(id, msg) {
    try {
      await service.getSubscriber(id);
    } catch (err) {
      assert.match(err.message, msg);
    }
  }

  it('should get the subscriber', async() => {
    const expected = {
      id: id,
      name: 'John'
    };
    subscriberModelStub.returns(Promise.resolve([expected]));

    const subscriber = await service.getSubscriber(id);
    assert.match(subscriber, expected);
  });

  it('should get no subscriber when given no id', async() => {
    await assertGetSubscriberError(undefined,
      'Received an invalid subscriber id!');
  });

  it('should get no subscriber when given an invalid id', async() => {
    await assertGetSubscriberError(1, 'Received an invalid subscriber id!');
  });

  it('should get no subscriber when subscriber does not exist', async() => {
    subscriberModelStub.returns(Promise.resolve([]));
    const subscriber = await service.getSubscriber(id);
    assert.match(subscriber, undefined);
  });

  it('should fail to get the subscriber', async() => {
    const expected = new Error('Failed to get subscriber!');
    subscriberModelStub.throws(expected);
    await assertGetSubscriberError(id, expected.message);
  });
});

describe('createSubscriber', () => {
  const subscriber = {
    name: 'John',
    email: 'john.doe@foobar.com',
    password: 'Fr$010@$dlskvM'
  };
  const hashedAndSaltedPassword = '$2a$10$wlIrBlZMrdR0.' +
    'VoJTDOT9e8WTFEnxLDUKxBVTw63UnBIwWKT3VFvm';
  let subscriberModelStub;
  let bcryptStub;

  beforeEach(() => {
    subscriberModelStub = sinon.stub(subscriberModel, 'create');
    bcryptStub = sinon.stub(bcrypt, 'hash');
  });
  afterEach(() => {
    subscriberModelStub.restore();
    bcryptStub.restore();
  });

  async function assertCreateSubscriberError(data, msg) {
    try {
      await service.createSubscriber(data);
    } catch (err) {
      assert.match(err.message, msg);
    }
  }

  it('should create a subscriber', async() => {
    subscriberModelStub.returns(Promise.resolve());
    bcryptStub.returns(Promise.resolve(hashedAndSaltedPassword));
    const result = await service.createSubscriber(subscriber);
    assert.match(result, undefined);
  });

  it('should not create a subscriber when missing payload', async() => {
    await assertCreateSubscriberError(undefined,
      'Received an invalid payload format!');
  });

  it('should not create a subscriber when payload is not an object',
    async() => {
      await assertCreateSubscriberError([{
        id: 1
      }], 'Received an invalid payload format!');
    });

  it('should not create a subscriber when missing name', async() => {
    await assertCreateSubscriberError({
      id: 1
    }, 'Missing subscriber name!');
  });

  it('should not create a subscriber when name exceeds max length', async() => {
    await assertCreateSubscriberError({
      name: 's'.repeat(150)
    }, 'Name exceeded 120 characters or contains special characters!');
  });

  it('should not create a subscriber when name contains special characters',
    async() => {
      await assertCreateSubscriberError({
        name: '$am'
      }, 'Name exceeded 120 characters or contains special characters!');
    });

  it('should not create a subscriber when missing the email address',
    async() => {
      await assertCreateSubscriberError({
        name: 'John',
        email: null
      }, 'Missing/Invalid subscriber email address!');
    });

  it('should not create a subscriber when given an invalid email', async() => {
    await assertCreateSubscriberError({
      name: 'James',
      email: 'james101.com'
    }, 'Missing/Invalid subscriber email address!');
  });

  it('should not create a subscriber when email exceeds max length',
    async() => {
      await assertCreateSubscriberError({
        name: 'Melissa',
        email: 's'.repeat(250) + '@foobar.com'
      }, 'Missing/Invalid subscriber email address!');
    });

  it('should not create a subscriber when missing the password', async() => {
    await assertCreateSubscriberError({
      name: 'Tim',
      email: 'tim.doe@foobar.com',
      password: ''
    }, 'Missing password or password was not a string value!');
  });

  it('should not create a subscriber when password is not a string',
    async() => {
      await assertCreateSubscriberError({
        name: 'Greg',
        email: 'greg.smith@foobar.com',
        password: 10001234
      }, 'Missing password or password was not a string value!');
    });

  it('should not create a subscriber when password does not match rule',
    async() => {
      await assertCreateSubscriberError({
          name: 'Greg',
          email: 'greg.smith@foobar.com',
          password: 'password'
        }, 'Password must be at least 12 characters, contain' +
        ' 1 uppercase and lowercase, 1 digit, and 1 special character.');
    });

  it('should fail to create a subscriber when hashing/salting fails',
    async() => {
      const expected = new Error('Failed to hash/salt password!');
      bcryptStub.throws(expected);
      await assertCreateSubscriberError(subscriber, expected.message);
    });

  it('should fail to create a subscriber', async() => {
    const expected = new Error('Failed to create subscriber!');
    bcryptStub.returns(Promise.resolve(hashedAndSaltedPassword));
    subscriberModelStub.throws(expected);
    await assertCreateSubscriberError(subscriber, expected.message);
  });
});
