/* eslint no-underscore-dangle: "off" */
import { expect } from 'chai';

import makeApp from '../src/app';
// eslint-disable-next-line import/named
import { __RewireAPI__ as rewireApi } from '../src/auth';
import { postExpect } from './helpers';

describe('As new web user, I can register', () => {
  describe('Bad Method Calls', () => {
    it('should reject request without email and password', async () => {
      await postExpect('/api/v1/auth/register', {}, 400);
    });
  });
  describe('Registration', () => {
    it('should register new user', async () => {
      rewireApi.__Rewire__('db', {
        User: {
          findOne({ email: _email }) { return { async exec() { return Promise.resolve(null); } }; },
          async create() { return Promise.resolve(); },
        },
      });

      const res = await postExpect('/api/v1/auth/register',
        {
          email: 'user1@test.com',
          password: 'passpass',
        }, 200);
      expect(res.body.ok).to.be.true;
    });

    it('should reject existing email', async () => {
      rewireApi.__Rewire__('db', {
        User: {
          findOne({ email }) { return { async exec() { return Promise.resolve({ email }); } }; },
          async create() { return Promise.resolve(); },
        },
      });

      const res = await postExpect('/api/v1/auth/register', {}, 400);
      expect(res.body.ok).to.be.false;
      expect(res.body.errors).to.have.length(1);
    });
  });
});

describe('As an existing chatter, I can login', () => {
  let app;

  describe('Bad Method Calls', () => {
    it('should reject request without email and password', async () => {
      const user = {
        username: 'user1',
        email: 'user1@test.com',
        displayName: 'User One',
      };

      rewireApi.__Rewire__('db', {
        User: {
          findOne({ email: _email }) { return { async exec() { return Promise.resolve(user); } }; },
        },
      });

      const res = await postExpect('/api/v1/auth/login', {}, 400);
      expect(res.body.ok).to.be.false;
    });
  });

  describe('Authentication', () => {
    it('should authorize given a valid login', async () => {
      const user = {
        id: 'u1',
        username: 'user1',
        email: 'user1@test.com',
        displayName: 'User One',
      };

      app = makeApp();
      rewireApi.__Rewire__('db', {
        User: {
          findOne({ email: _email }) { return { async exec() { return Promise.resolve(user); } }; },
        },
      });

      const res = await postExpect('/api/v1/auth/login',
        {
          email: 'user1@test.com',
          password: 'passpass',
        }, 200);

      expect(res.body.authToken).to.be.ok;
    });
  });
});
