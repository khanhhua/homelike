/* eslint no-underscore-dangle: "off" */

import supertest from 'supertest';
import chai, { expect } from 'chai';

import makeApp from '../src/app';
// eslint-disable-next-line import/named
import { __RewireAPI__ as rewireApi } from '../src/auth';

describe('As new web user, I can register', () => {
  let app;

  describe('Bad Method Calls', () => {
    it('should reject request without email and password', async () => {
      app = makeApp();
      await supertest(app.callback())
        .post('/api/v1/auth/register')
        .set('Content-Type', 'application/json')
        .send({})
        .expect(400);
    });
  });
  describe('Registration', () => {
    it('should register new user', async () => {
      app = makeApp();
      rewireApi.__Rewire__('db', {
        User: {
          findOne({ email: _email }) { return { async exec() { return Promise.resolve(null); } }; },
          async create() { return Promise.resolve(); },
        },
      });

      await supertest(app.callback())
        .post('/api/v1/auth/register')
        .set('Content-Type', 'application/json')
        .send({
          email: 'user1',
          password: 'passpass',
        })
        .expect(200);
    });

    it('should reject existing email', async () => {
      app = makeApp();
      rewireApi.__Rewire__('db', {
        User: {
          findOne({ email }) { return { async exec() { return Promise.resolve({ email }); } }; },
          async create() { return Promise.resolve(); },
        },
      });

      await supertest(app.callback())
        .post('/api/v1/auth/register')
        .set('Content-Type', 'application/json')
        .send({})
        .expect(400);
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

      app = makeApp();
      rewireApi.__Rewire__('db', {
        User: {
          findOne({ email: _email }) { return { async exec() { return Promise.resolve(user); } }; },
        },
      });

      await supertest(app.callback())
        .post('/api/v1/auth/login')
        .set('Content-Type', 'application/json')
        .send({})
        .expect(400);
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

      await supertest(app.callback())
        .post('/api/v1/auth/login')
        .set('Content-Type', 'application/json')
        .send({
          email: 'user1@test.com',
          password: 'passpass',
        })
        .expect(200);

      // expect(res.body.authToken).to.be.ok;
    });
  });
});
