/* eslint no-underscore-dangle: "off" */
import { expect } from 'chai';

// eslint-disable-next-line import/named
import { __RewireAPI__ as rewireApi } from '../src/channels';
import { getExpect, mockQuery, withAccesToken } from './helpers';

describe('As a web user, I can list channels', () => {
  describe('Bad Method Calls', () => {
    it('should reject unauthorized access', async () => {
      await getExpect('/api/v1/channels', 401);
    });
  });

  describe('Channel List', () => {
    it('should retrieve 3 channels', async () => {
      const channels = [
        { id: '1', name: 'Channel One', chatters: [] },
        { id: '2', name: 'Channel Two', chatters: [] },
        { id: '3', name: 'Channel Three', chatters: [] },
      ];

      rewireApi.__Rewire__('Channel', {
        find() { return mockQuery(channels); },
      });

      const authedGet = withAccesToken(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.'
        + 'eyJzdWIiOiJ1MSIsInVzZXJuYW1lIjoidXNlcjEiLCJpYXQiOjE1MTYyMzkwMjJ9.'
        + '9GcSD5oGwzeTzEF1IGT5F3GuREXq0lNjdAsLSgDrnwE', getExpect);
      const res = await authedGet('/api/v1/channels', 200);
      expect(res.body.ok).to.be.true;
      expect(res.body.channels).to.be.deep.equal(channels);
    });
  });

  describe('Channel Detail', () => {
    it('should retrieve details of one channel', async () => {
      const channel = {
        id: '1', name: 'Channel One', chatters: [],
      };
      rewireApi.__Rewire__('Channel', {
        findById() { return mockQuery(channel); },
      });
      rewireApi.__Rewire__('queryMessagesByAnchor', async (_channelId, _anchorISO) => Promise.resolve([]));


      const authedGet = withAccesToken(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.'
        + 'eyJzdWIiOiJ1MSIsInVzZXJuYW1lIjoidXNlcjEiLCJpYXQiOjE1MTYyMzkwMjJ9.'
        + '9GcSD5oGwzeTzEF1IGT5F3GuREXq0lNjdAsLSgDrnwE', getExpect);
      const res = await authedGet('/api/v1/channels/1', 200);
      expect(res.body.ok).to.be.true;
      expect(res.body.channel).to.be.deep.equal({ ...channel, messages: [], });
    });
  })
});
