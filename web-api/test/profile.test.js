/* eslint no-underscore-dangle: "off" */
import { expect } from 'chai';
// eslint-disable-next-line import/named
import { __RewireAPI__ as rewireApi } from '../src/profile';
import { getExpect, mockQuery, putExpect, withAccesToken } from './helpers';

describe('As a logged in user, I would like to view my own profile', () => {
  describe('Bad Method Calls', () => {
    it('shoud reject unauthorized access', async () => {
      await getExpect('/api/v1/profile', {}, 401);
    });
  });

  describe('View Profile', () => {
    it('should present me my own profile', async () => {
      const profile = {
        id: 'u1',
        displayName: 'User One',
        username: 'user1',
        email: 'user1@mailinator.com',
      };
      rewireApi.__Rewire__('User', {
        findById(_id) {
          return mockQuery(profile);
        },
      });

      const authedGet = withAccesToken(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.'
        + 'eyJzdWIiOiJ1MSIsInVzZXJuYW1lIjoidXNlcjEiLCJpYXQiOjE1MTYyMzkwMjJ9.'
        + '9GcSD5oGwzeTzEF1IGT5F3GuREXq0lNjdAsLSgDrnwE', getExpect,
      );
      await authedGet('/api/v1/profile', 200);
    });
  });
});

describe('As a logged in user, I would like to list others\' prpfiles', () => {
  describe('List Profiles', () => {
    it('should list zero user profiles given no IDs', async () => {
      rewireApi.__Rewire__('User', {
        find(_criteria) {
          return mockQuery([]);
        },
      });

      const authedGet = withAccesToken(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.'
        + 'eyJzdWIiOiJ1MSIsInVzZXJuYW1lIjoidXNlcjEiLCJpYXQiOjE1MTYyMzkwMjJ9.'
        + '9GcSD5oGwzeTzEF1IGT5F3GuREXq0lNjdAsLSgDrnwE', getExpect,
      );
      const res = await authedGet('/api/v1/users?ids=u2,u3', 200);
      expect(res.body.users).to.be.ok;
      expect(res.body.users).to.have.length(0);
    });
    it('should list user profiles for a given array of IDs', async () => {
      const profiles = [
        {
          id: 'u2',
          displayName: 'User Two',
          username: 'user2',
          email: 'user2@mailinator.com',
        },
        {
          id: 'u3',
          displayName: 'User Three',
          username: 'user3',
          email: 'user3@mailinator.com',
        },
      ];
      rewireApi.__Rewire__('User', {
        find(_criteria) {
          return mockQuery(profiles);
        },
      });

      const authedGet = withAccesToken(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.'
        + 'eyJzdWIiOiJ1MSIsInVzZXJuYW1lIjoidXNlcjEiLCJpYXQiOjE1MTYyMzkwMjJ9.'
        + '9GcSD5oGwzeTzEF1IGT5F3GuREXq0lNjdAsLSgDrnwE', getExpect,
      );
      const res = await authedGet('/api/v1/users?ids=u2,u3', 200);
      expect(res.body.users).to.be.ok;
      expect(res.body.users).to.have.length(2);
    });
  });
});

describe('As a logged in user, I would like to update my own', () => {
  describe('Update Profile', () => {
    it('should update me my own profile', async () => {
      const updatedProfile = {
        id: 'u1',
        displayName: 'Pink',
        username: 'user1',
        email: 'user1@mailinator.com',
        timezone: 'Singapore/Kalua_Lumpur',
      };
      rewireApi.__Rewire__('User', {
        findById(_id) { return mockQuery(updatedProfile); },
        updateOne(_id) { return mockQuery({}); },
      });

      const authedPut = withAccesToken(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.'
        + 'eyJzdWIiOiJ1MSIsInVzZXJuYW1lIjoidXNlcjEiLCJpYXQiOjE1MTYyMzkwMjJ9.'
        + '9GcSD5oGwzeTzEF1IGT5F3GuREXq0lNjdAsLSgDrnwE', putExpect,
      );
      const res = await authedPut('/api/v1/profile',
        {
          displayName: 'Pink',
          timezone: 'Singapore/Kalua_Lumpur',
        }, 200);
      expect(res.body.ok).to.be.true;
      expect(res.body.profile).to.be.deep.equal(updatedProfile);
    });

    it('should reject updates profiles not belonging to', async () => {
      const updatedProfile = {
        id: 'u1someone',
        displayName: 'Pink',
        username: 'user1',
        email: 'user1@mailinator.com',
        timezone: 'Singapore/Kalua_Lumpur',
      };
      rewireApi.__Rewire__('User', {
        findById(_id) { return mockQuery(updatedProfile); },
        updateOne(_id) { return mockQuery({}); },
      });

      const authedPut = withAccesToken(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.'
        + 'eyJzdWIiOiJ1MSIsInVzZXJuYW1lIjoidXNlcjEiLCJpYXQiOjE1MTYyMzkwMjJ9.'
        + '9GcSD5oGwzeTzEF1IGT5F3GuREXq0lNjdAsLSgDrnwE', putExpect,
      );
      const res = await authedPut('/api/v1/profile',
        {
          id: 'u1someone',
          displayName: 'Pink',
          timezone: 'Singapore/Kalua_Lumpur',
        }, 403);
    });
  });
});
