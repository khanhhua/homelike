/* eslint no-underscore-dangle: "off" */
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

// eslint-disable-next-line import/named
import moment from 'moment';
import { __RewireAPI__ as rewireApi } from '../src/messages';
import {
  delExpect,
  getExpect, mockQuery, postExpect, putExpect, withAccesToken,
} from './helpers';

chai.use(sinonChai);

describe('As a logged in user, I can list messages from one channel', () => {
  describe('Bad Method Calls', () => {
    it('should reject unauthorized access', async () => {
      await getExpect('/api/v1/channels/1/messages', 401);
    });
  });

  describe('Get chat messages', () => {
    it('should list all messages within daily chunk', async () => {
      const messagesChunkToday = [
        { id: 'm2', sender: 'u2', body: 'Message two' },
      ];
      const queryMessagesByAnchor = sinon.spy(() => Promise.resolve(messagesChunkToday));

      rewireApi.__Rewire__('queryMessagesByAnchor', queryMessagesByAnchor);

      const authedGet = withAccesToken(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.'
        + 'eyJzdWIiOiJ1MSIsInVzZXJuYW1lIjoidXNlcjEiLCJpYXQiOjE1MTYyMzkwMjJ9.'
        + '9GcSD5oGwzeTzEF1IGT5F3GuREXq0lNjdAsLSgDrnwE', getExpect,
      );

      const res = await authedGet('/api/v1/channels/1/messages', 200);
      expect(queryMessagesByAnchor).to.have.been.calledWith('1', undefined);
      expect(res.body.ok).to.be.true;
      expect(res.body.messages).to.be.deep.equal(messagesChunkToday);
    });

    it('should list messages with respect to the anchor', async () => {
      const messagesChunkToday = [
        { id: 'm2', sender: 'u2', body: 'Message two' },
      ];
      const queryMessagesByAnchor = sinon.spy(() => Promise.resolve(messagesChunkToday));

      rewireApi.__Rewire__('queryMessagesByAnchor', queryMessagesByAnchor);

      const authedGet = withAccesToken(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.'
        + 'eyJzdWIiOiJ1MSIsInVzZXJuYW1lIjoidXNlcjEiLCJpYXQiOjE1MTYyMzkwMjJ9.'
        + '9GcSD5oGwzeTzEF1IGT5F3GuREXq0lNjdAsLSgDrnwE', getExpect,
      );

      const res = await authedGet('/api/v1/channels/1/messages?anchor=1539697000000', 200);
      expect(queryMessagesByAnchor).to.have.been.calledWith('1', moment(1539697000000).utc());
      expect(res.body.ok).to.be.true;
      expect(res.body.messages).to.be.deep.equal(messagesChunkToday);
    });
  });
});

describe('As a logged in user, I can post new messages to one channel', () => {
  describe('Bad Method Calls', () => {
    it('should reject unauthorized access', async () => {
      await postExpect('/api/v1/channels/1/messages', {}, 401);
    });
  });

  describe('Post New Message', () => {
    it('should post new message to active chunk', async () => {
      const message = {
        text: 'Message Text',
      };
      const CHANNEL_ID = 'channel1';
      const CHUNK_ID = 'chunk1';

      const findByIdAndUpdate = sinon.spy(() => Promise.resolve());
      rewireApi.__Rewire__('Channel', { findByIdAndUpdate });

      const allocateChunk = sinon.spy(() => Promise.resolve(CHUNK_ID));
      rewireApi.__Rewire__('allocateChunk', allocateChunk);

      const updateOne = sinon.spy((_criteria, _updates, callback) => callback(null, { ok: true }));
      rewireApi.__Rewire__('ChannelChunk', { updateOne });

      const broadcastChatMessage = sinon.spy(() => Promise.resolve());
      rewireApi.__Rewire__('broadcastChatMessage', broadcastChatMessage);

      const authedPost = withAccesToken(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.'
        + 'eyJzdWIiOiJ1MSIsInVzZXJuYW1lIjoidXNlcjEiLCJpYXQiOjE1MTYyMzkwMjJ9.'
        + '9GcSD5oGwzeTzEF1IGT5F3GuREXq0lNjdAsLSgDrnwE', postExpect,
      );
      const res = await authedPost(`/api/v1/channels/${CHANNEL_ID}/messages`, message, 200);
      expect(res.body.ok).to.be.true;

      expect(findByIdAndUpdate).to.have.been.calledWith(CHANNEL_ID, { $addToSet: { chatters: 'u1' } });
      expect(allocateChunk).to.have.been.calledWith(CHANNEL_ID);
      expect(updateOne).to.have.been.calledWith({ _id: CHUNK_ID });

      expect(broadcastChatMessage).to.have.been.called;

      const boardcastArgs = broadcastChatMessage.args[0];
      expect(boardcastArgs[0]).to.be.equal('create');
      expect(boardcastArgs[1]).to.be.equal(CHANNEL_ID);
      expect(boardcastArgs[2]).to.have.keys('id', 'sender', 'body', 'createdAt');
      expect(boardcastArgs[2]).to.include({
        sender: 'u1',
        body: message.text,
      });
    });
  });
});

describe('As a logged in owner, I can edit my own message', function () {
  describe('Bad Method Calls', () => {
    it('should reject unauthorized access', async () => {
      await putExpect('/api/v1/channels/1/messages/m1', {}, 401);
    });
  });

  describe('Edit My Message', () => {
    it('should replace existing body with new', async () => {
      const message = {
        text: 'Updated Message Text',
      };

      const MESSAGE_ID = 'm1';
      const CHANNEL_ID = 'channel1';
      const CHUNK_ID = 'chunk1';

      const findById = sinon.spy(() => mockQuery({ activeChunk: CHUNK_ID }));
      rewireApi.__Rewire__('Channel', { findById });

      const updateOne = sinon.spy((_criteria, _updates) => Promise.resolve({ ok: true }));
      rewireApi.__Rewire__('ChannelChunk', { updateOne });

      const broadcastChatMessage = sinon.spy(() => Promise.resolve());
      rewireApi.__Rewire__('broadcastChatMessage', broadcastChatMessage);

      const authedPut = withAccesToken(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.'
        + 'eyJzdWIiOiJ1MSIsInVzZXJuYW1lIjoidXNlcjEiLCJpYXQiOjE1MTYyMzkwMjJ9.'
        + '9GcSD5oGwzeTzEF1IGT5F3GuREXq0lNjdAsLSgDrnwE', putExpect,
      );
      const res = await authedPut(`/api/v1/channels/${CHANNEL_ID}/messages/${MESSAGE_ID}`, message, 200);
      expect(res.body.ok).to.be.true;

      expect(findById).to.have.been.calledWith(CHANNEL_ID);
      expect(updateOne).to.have.been.calledWith(
        { _id: CHUNK_ID, messages: { $elemMatch: { _id: MESSAGE_ID, sender: 'u1' } } });

      expect(broadcastChatMessage).to.have.been.called;

      const boardcastArgs = broadcastChatMessage.args[0];
      expect(boardcastArgs[0]).to.be.equal('edit');
      expect(boardcastArgs[1]).to.be.equal(CHANNEL_ID);
      expect(boardcastArgs[2]).to.have.keys('id', 'sender', 'body');
      expect(boardcastArgs[2]).to.include({
        sender: 'u1',
        body: message.text,
      });
    });
  });
});


describe('As a logged in owner, I can remove my own message', function () {
  describe('Bad Method Calls', () => {
    it('should reject unauthorized access', async () => {
      await delExpect('/api/v1/channels/1/messages/m1', {}, 401);
    });
  });

  describe('Delete My Message', () => {
    it('should delete my own message', async () => {
      const MESSAGE_ID = 'm1';
      const CHANNEL_ID = 'channel1';
      const CHUNK_ID = 'chunk1';

      const findById = sinon.spy(() => mockQuery({ activeChunk: CHUNK_ID }));
      rewireApi.__Rewire__('Channel', { findById });

      const updateOne = sinon.spy((_criteria, _updates) => Promise.resolve({ ok: true }));
      rewireApi.__Rewire__('ChannelChunk', { updateOne });

      const broadcastChatMessage = sinon.spy(() => Promise.resolve());
      rewireApi.__Rewire__('broadcastChatMessage', broadcastChatMessage);

      const authedDel = withAccesToken(
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.'
        + 'eyJzdWIiOiJ1MSIsInVzZXJuYW1lIjoidXNlcjEiLCJpYXQiOjE1MTYyMzkwMjJ9.'
        + '9GcSD5oGwzeTzEF1IGT5F3GuREXq0lNjdAsLSgDrnwE', delExpect,
      );
      const res = await authedDel(`/api/v1/channels/${CHANNEL_ID}/messages/${MESSAGE_ID}`, 200);
      expect(res.body.ok).to.be.true;

      expect(findById).to.have.been.calledWith(CHANNEL_ID);
      expect(updateOne).to.have.been.calledWith(
        { _id: CHUNK_ID }, { $pull: { messages: { _id: MESSAGE_ID, sender: 'u1' } } },
      );

      expect(broadcastChatMessage).to.have.been.called;

      const boardcastArgs = broadcastChatMessage.args[0];
      expect(boardcastArgs[0]).to.be.equal('remove');
      expect(boardcastArgs[1]).to.be.equal(CHANNEL_ID);
      expect(boardcastArgs[2]).to.be.deep.equal({ id: MESSAGE_ID });
    });

  });
});
