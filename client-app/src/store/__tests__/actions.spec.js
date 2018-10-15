/* eslint-env jest */

import * as actions from '../actions';
import { push } from 'react-router-redux';
import createStore from '..';
import {
  ACTION_AUTHENTICATE,
  ACTION_FIND_USERS,
  ACTION_LOAD_CHANNELS,
  ACTION_LOAD_PROFILE, ACTION_REMOVE_MESSAGE,
  ACTION_SAVE_PROFILE,
  ACTION_SELECT_CHANNEL, ACTION_SEND_TO_CHANNEL, ACTION_UPDATE_MESSAGE,
} from '../action-types';
import { ACTION_STATUS_ERROR, ACTION_STATUS_PENDING, ACTION_STATUS_SUCCESS } from '../action-statuses';
import getStreamer from '../streamer';
import * as api from '../api';

jest.mock('../streamer', () => (
  jest.fn().mockImplementation(() => ({ subscribe: () => {} }))
));

describe('action', () => {
  it('should convert params into action object', () => {
    expect(actions.action('a', 'b', 'c')).toEqual({
      type: 'a',
      status: 'b',
      payload: 'c',
    });
  });
});

describe('authenticate', () => {
  it('should give an auth token', (done) => {
    const authToken = 'abc';
    const userId = 'u1';
    const username = 'User 1';

    const response = {
      ok: true,
      authToken,
      username,
      id: userId,
    };

    fetch.resetMocks();
    fetch.mockResponseOnce(JSON.stringify(response));

    const store = createStore();
    const fn = actions.authenticate('john.doe@mailinator.com', 'p@ssword');
    const spy = jest.spyOn(store, 'dispatch');

    fn(store.dispatch).then(() => {
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls).toHaveLength(3);
      expect(spy.mock.calls[0][0]).toEqual(actions.action(ACTION_AUTHENTICATE, ACTION_STATUS_PENDING, undefined));
      expect(spy.mock.calls[1][0]).toEqual(actions.action(ACTION_AUTHENTICATE, ACTION_STATUS_SUCCESS, response));
      expect(spy.mock.calls[2][0]).toEqual(push('/channels'));

      done();
    });
  });
});

describe('loadChannels', () => {
  const channels = [
    {
      id: '1',
      name: 'Channel 1',
      createdAt: '2018-10-01T00:00:00Z',
      lastMsgAt: '2018-10-01T00:00:00Z',
      chatters: [],
    },
    {
      id: '2',
      name: 'Channel 2',
      createdAt: '2018-10-02T00:00:00Z',
      lastMsgAt: '2018-10-02T00:10:00Z',
      chatters: [],
    }];

  beforeEach(() => fetch.resetMocks());

  it('should load channels', (done) => {
    const response = {
      ok: true,
      channels,
    };
    fetch.mockResponseOnce(JSON.stringify(response));

    const store = createStore();
    const fn = actions.loadChannels();
    const spy = jest.spyOn(store, 'dispatch');

    fn(store.dispatch).then(() => {
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls).toHaveLength(2);
      expect(spy.mock.calls[0][0]).toEqual(actions.action(ACTION_LOAD_CHANNELS, ACTION_STATUS_PENDING));
      expect(spy.mock.calls[1][0]).toEqual(actions.action(ACTION_LOAD_CHANNELS, ACTION_STATUS_SUCCESS, channels));

      done();
    });
  });

  it('should dispatch error for a bad API call', (done) => {
    const response = {
      ok: false,
      code: 400,
      message: 'Bad Request',
    };

    fetch.mockResponseOnce(JSON.stringify(response), { status: 400 });

    const store = createStore({ channels: {} });
    const fn = actions.loadChannels();
    const spy = jest.spyOn(store, 'dispatch');
    const spyApiCall = jest.spyOn(api, 'loadChannels');

    fn(store.dispatch).then(() => {
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls).toHaveLength(2);

      expect(spy.mock.calls[0][0]).toEqual(actions.action(ACTION_LOAD_CHANNELS, ACTION_STATUS_PENDING));
      expect(spy.mock.calls[1][0]).toEqual(actions.action(ACTION_LOAD_CHANNELS, ACTION_STATUS_ERROR, response));

      expect(spyApiCall).toHaveBeenCalled();

      done();
    });
  });
});

describe('selectChannel', () => {
  it('should dispatch success for a good API call', (done) => {
    const channelId = '1';
    const selectedChannel = {
      id: '1',
      name: 'Channel 1',
      chatters: [],
      createdAt: '2018-10-01T00:00:00Z',
      lastMsgAt: '2018-10-01T00:00:00Z',
    };
    const response = {
      ok: true,
      channel: selectedChannel,
    };

    fetch.resetMocks();
    fetch.mockResponses(
      [JSON.stringify(response), { status: 200 }],
      [JSON.stringify({ ok: true, users: [] }, { status: 200 })],
    );

    const store = createStore({ channels: { 1: selectedChannel } });
    const fn = actions.selectChannel(channelId);
    const spy = jest.spyOn(store, 'dispatch');
    const spyApiCall = jest.spyOn(api, 'loadChannel');

    fn(store.dispatch).then(() => {
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls).toHaveLength(2);
      expect(spy.mock.calls[0][0]).toEqual(actions.action(ACTION_SELECT_CHANNEL, ACTION_STATUS_PENDING,
        { id: channelId }));
      expect(spy.mock.calls[1][0]).toEqual(actions.action(ACTION_SELECT_CHANNEL, ACTION_STATUS_SUCCESS, selectedChannel));
      expect(getStreamer).toHaveBeenCalled();

      expect(spyApiCall).toHaveBeenCalled();
      expect(spyApiCall.mock.calls[0]).toEqual([channelId, { anchor: 0 }]);

      done();
    });
  });

  it('should dispatch error for a bad API call', (done) => {
    const channelId = '1';
    const selectedChannel = {
      id: channelId,
      name: 'Channel 1',
      chatters: [],
      createdAt: '2018-10-01T00:00:00Z',
      lastMsgAt: '2018-10-01T00:00:00Z',
    };
    const response = {
      ok: false,
      code: 400,
      message: 'Bad Request',
    };

    fetch.mockResponseOnce(JSON.stringify(response), { status: 400 });

    const store = createStore({ channels: { [channelId]: selectedChannel } });
    const fn = actions.selectChannel(channelId);
    const spy = jest.spyOn(store, 'dispatch');
    const spyApiCall = jest.spyOn(api, 'loadChannel');

    fn(store.dispatch).then(() => {
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls).toHaveLength(2);

      expect(spy.mock.calls[0][0]).toEqual(actions.action(ACTION_SELECT_CHANNEL, ACTION_STATUS_PENDING,
        { id: channelId }));
      expect(spy.mock.calls[1][0]).toEqual(actions.action(ACTION_SELECT_CHANNEL, ACTION_STATUS_ERROR, response));

      expect(spyApiCall).toHaveBeenCalled();
      expect(spyApiCall.mock.calls[0]).toEqual([channelId, { anchor: 0 }]);

      done();
    });
  });
});

describe('sendMessage', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  it('should dispatch success for a good API call', (done) => {
    const channelId = 'abc';
    const messageId = '123';
    const message = { id: messageId, sender: 'u1', body: 'existing body' };
    const response = {
      ok: true,
      message,
    };

    fetch.mockResponseOnce(JSON.stringify(response));

    const store = createStore({ chats: { [channelId]: [message] } });
    const fn = actions.sendMessage(channelId, message);
    const spy = jest.spyOn(store, 'dispatch');
    const spyApiCall = jest.spyOn(api, 'sendMessage');

    fn(store.dispatch).then(() => {
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls).toHaveLength(2);
      expect(spy.mock.calls[0][0]).toEqual(actions.action(ACTION_SEND_TO_CHANNEL, ACTION_STATUS_PENDING,
        { channelId, message }));
      expect(spy.mock.calls[1][0]).toEqual(actions.action(ACTION_SEND_TO_CHANNEL, ACTION_STATUS_SUCCESS, message));

      expect(spyApiCall).toHaveBeenCalled();
      expect(spyApiCall.mock.calls[0]).toEqual([channelId, message]);

      done();
    });
  });

  it('should dispatch error for a bad API call', (done) => {
    const channelId = 'abc';
    const messageId = '123';
    const message = { id: messageId, sender: 'u1', body: 'existing body' };
    const newMessage = { id: messageId, sender: 'u1', body: 'updated body' };
    const response = {
      ok: false,
      code: 400,
      message: 'Bad Request',
    };

    fetch.mockResponseOnce(JSON.stringify(response), { status: 400 });

    const store = createStore({ chats: { [channelId]: [message] } });
    const fn = actions.updateMessage(channelId, messageId, newMessage);
    const spy = jest.spyOn(store, 'dispatch');
    const spyApiCall = jest.spyOn(api, 'updateMessage');

    fn(store.dispatch).then(() => {
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls).toHaveLength(2);

      expect(spy.mock.calls[0][0]).toEqual(actions.action(ACTION_UPDATE_MESSAGE, ACTION_STATUS_PENDING,
        { channelId, messageId, message: newMessage }));
      expect(spy.mock.calls[1][0]).toEqual(actions.action(ACTION_UPDATE_MESSAGE, ACTION_STATUS_ERROR, response));

      expect(spyApiCall).toHaveBeenCalled();
      expect(spyApiCall.mock.calls[0]).toEqual([channelId, message.id, newMessage]);

      done();
    });
  });
});

describe('updateMessage', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  it('should dispatch success for a good API call', (done) => {
    const channelId = 'abc';
    const messageId = '123';
    const message = { id: messageId, sender: 'u1', body: 'existing body' };
    const newMessage = { id: messageId, sender: 'u1', body: 'updated body' };
    const response = {
      ok: true,
      message: newMessage,
    };

    fetch.mockResponseOnce(JSON.stringify(response));

    const store = createStore({ chats: { [channelId]: [message] } });
    const fn = actions.updateMessage(channelId, messageId, newMessage);
    const spy = jest.spyOn(store, 'dispatch');
    const spyApiCall = jest.spyOn(api, 'updateMessage');

    fn(store.dispatch).then(() => {
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls).toHaveLength(2);
      expect(spy.mock.calls[0][0]).toEqual(actions.action(ACTION_UPDATE_MESSAGE, ACTION_STATUS_PENDING,
        { channelId, messageId, message: newMessage }));
      expect(spy.mock.calls[1][0]).toEqual(actions.action(ACTION_UPDATE_MESSAGE, ACTION_STATUS_SUCCESS,
        { id: channelId, messages: [newMessage] }));

      expect(spyApiCall).toHaveBeenCalled();
      expect(spyApiCall.mock.calls[0]).toEqual([channelId, message.id, newMessage]);

      done();
    });
  });

  it('should dispatch error for a bad API call', (done) => {
    const channelId = 'abc';
    const messageId = '123';
    const message = { id: messageId, sender: 'u1', body: 'existing body' };
    const newMessage = { id: messageId, sender: 'u1', body: 'updated body' };
    const response = {
      ok: false,
      code: 400,
      message: 'Bad Request',
    };

    fetch.mockResponseOnce(JSON.stringify(response), { status: 400 });

    const store = createStore({ chats: { [channelId]: [message] } });
    const fn = actions.updateMessage(channelId, messageId, newMessage);
    const spy = jest.spyOn(store, 'dispatch');
    const spyApiCall = jest.spyOn(api, 'updateMessage');

    fn(store.dispatch).then(() => {
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls).toHaveLength(2);

      expect(spy.mock.calls[0][0]).toEqual(actions.action(ACTION_UPDATE_MESSAGE, ACTION_STATUS_PENDING,
        { channelId, messageId, message: newMessage }));
      expect(spy.mock.calls[1][0]).toEqual(actions.action(ACTION_UPDATE_MESSAGE, ACTION_STATUS_ERROR, response));

      expect(spyApiCall).toHaveBeenCalled();
      expect(spyApiCall.mock.calls[0]).toEqual([channelId, message.id, newMessage]);

      done();
    });
  });
});

describe('removeMessage', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  it('should dispatch success for a good API call', (done) => {
    const channelId = 'abc';
    const message = { id: '123' };
    const response = {
      ok: true,
    };

    fetch.mockResponseOnce(JSON.stringify(response));

    const store = createStore({ chats: { [channelId]: [message] } });
    const fn = actions.removeMessage(channelId, message);
    const spy = jest.spyOn(store, 'dispatch');
    const spyApiCall = jest.spyOn(api, 'removeMessage');

    fn(store.dispatch).then(() => {
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls).toHaveLength(2);
      expect(spy.mock.calls[0][0]).toEqual(actions.action(ACTION_REMOVE_MESSAGE, ACTION_STATUS_PENDING,
        { channelId, message }));
      expect(spy.mock.calls[1][0]).toEqual(actions.action(ACTION_REMOVE_MESSAGE, ACTION_STATUS_SUCCESS,
        { id: channelId, messages: [message] }));

      expect(spyApiCall).toHaveBeenCalled();
      expect(spyApiCall.mock.calls[0]).toEqual([channelId, message.id]);

      done();
    });
  });

  it('should dispatch error for a bad API call', (done) => {
    const channelId = 'abc';
    const message = { id: '123' };
    const response = {
      ok: false,
      code: 400,
      message: 'Bad Request',
    };

    fetch.mockResponseOnce(JSON.stringify(response), { status: 400 });

    const store = createStore({ chats: { [channelId]: [message] } });
    const fn = actions.removeMessage(channelId, message);
    const spy = jest.spyOn(store, 'dispatch');
    const spyApiCall = jest.spyOn(api, 'removeMessage');

    fn(store.dispatch).then(() => {
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls).toHaveLength(2);

      expect(spy.mock.calls[0][0]).toEqual(actions.action(ACTION_REMOVE_MESSAGE, ACTION_STATUS_PENDING,
        { channelId, message }));
      expect(spy.mock.calls[1][0]).toEqual(actions.action(ACTION_REMOVE_MESSAGE, ACTION_STATUS_ERROR, response));

      expect(spyApiCall).toHaveBeenCalled();
      expect(spyApiCall.mock.calls[0]).toEqual([channelId, message.id]);

      done();
    });
  });
});

describe('loadProfile', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  it('should dispatch success for a good API call', (done) => {
    const profile = {
      id: 'u1',
      username: 'user1',
      displayName: 'User One',
      work: 'Web Developer',
      phone: '+65 8989 0991',
      timezone: 'Asia/Kuala_Lumpur',
      avatarUrl: 'https://picsum.photos/192/192',
    };
    const response = {
      ok: true,
      profile,
    };

    fetch.mockResponseOnce(JSON.stringify(response));

    const store = createStore();
    const fn = actions.loadProfile();
    const spy = jest.spyOn(store, 'dispatch');
    const spyApiCall = jest.spyOn(api, 'loadProfile');

    fn(store.dispatch).then(() => {
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls).toHaveLength(2);
      expect(spy.mock.calls[0][0]).toEqual(actions.action(ACTION_LOAD_PROFILE, ACTION_STATUS_PENDING));
      expect(spy.mock.calls[1][0]).toEqual(actions.action(ACTION_LOAD_PROFILE, ACTION_STATUS_SUCCESS, profile));

      expect(spyApiCall).toHaveBeenCalled();

      done();
    });
  });

  it('should dispatch error for a bad API call', (done) => {
    const response = {
      ok: false,
      code: 400,
      message: 'Bad Request',
    };

    fetch.mockResponseOnce(JSON.stringify(response), { status: 400 });

    const store = createStore();
    const fn = actions.loadProfile();
    const spy = jest.spyOn(store, 'dispatch');
    const spyApiCall = jest.spyOn(api, 'loadProfile');

    fn(store.dispatch).then(() => {
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls).toHaveLength(2);

      expect(spy.mock.calls[0][0]).toEqual(actions.action(ACTION_LOAD_PROFILE, ACTION_STATUS_PENDING));
      expect(spy.mock.calls[1][0]).toEqual(actions.action(ACTION_LOAD_PROFILE, ACTION_STATUS_ERROR, response));

      expect(spyApiCall).toHaveBeenCalled();

      done();
    });
  });
});

describe('findUser', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  it('should dispatch success for a good API call', (done) => {
    const response = {
      ok: true,
      users: [
        {
          id: 'u1',
          username: 'user1',
          displayName: 'User One',
          avatarUrl: 'https://picsum.photos/192/192',
        },
      ],
    };

    fetch.mockResponseOnce(JSON.stringify(response));

    const store = createStore();
    const fn = actions.findUser('u1');
    const spy = jest.spyOn(store, 'dispatch');
    const spyApiCall = jest.spyOn(api, 'findUsers');

    fn(store.dispatch).then(() => {
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls).toHaveLength(2);
      expect(spy.mock.calls[0][0]).toEqual(actions.action(ACTION_FIND_USERS, ACTION_STATUS_PENDING));
      expect(spy.mock.calls[1][0]).toEqual(actions.action(ACTION_FIND_USERS, ACTION_STATUS_SUCCESS, response.users));

      expect(spyApiCall).toHaveBeenCalled();
      expect(spyApiCall.mock.calls[0][0]).toEqual(['u1']);

      done();
    });
  });

  it('should dispatch error for a bad API call', (done) => {
    const response = {
      ok: false,
      code: 400,
      message: 'Bad Request',
    };

    fetch.mockResponseOnce(JSON.stringify(response), { status: 400 });

    const store = createStore();
    const fn = actions.findUser('u1');
    const spy = jest.spyOn(store, 'dispatch');
    const spyApiCall = jest.spyOn(api, 'findUsers');

    fn(store.dispatch).then(() => {
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls).toHaveLength(2);

      expect(spy.mock.calls[0][0]).toEqual(actions.action(ACTION_FIND_USERS, ACTION_STATUS_PENDING));
      expect(spy.mock.calls[1][0]).toEqual(actions.action(ACTION_FIND_USERS, ACTION_STATUS_ERROR, response));

      expect(spyApiCall).toHaveBeenCalled();
      expect(spyApiCall.mock.calls[0][0]).toEqual(['u1']);

      done();
    });
  });
});

describe('saveProfile', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  it('should dispatch success for a good API call', (done) => {
    const profile = {
      id: 'u1',
      username: 'user1',
      displayName: 'User One',
      work: 'Web Developer',
      phone: '+65 8989 0991',
      timezone: 'Asia/Kuala_Lumpur',
      avatarUrl: 'https://picsum.photos/192/192',
    };
    const response = {
      ok: true,
      profile,
    };

    fetch.mockResponseOnce(JSON.stringify(response));

    const store = createStore();
    const fn = actions.saveProfile(profile);
    const spy = jest.spyOn(store, 'dispatch');
    const spyApiCall = jest.spyOn(api, 'saveProfile');

    fn(store.dispatch).then(() => {
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls).toHaveLength(2);
      expect(spy.mock.calls[0][0]).toEqual(actions.action(ACTION_SAVE_PROFILE, ACTION_STATUS_PENDING));
      expect(spy.mock.calls[1][0]).toEqual(actions.action(ACTION_SAVE_PROFILE, ACTION_STATUS_SUCCESS, response.profile));

      expect(spyApiCall).toHaveBeenCalled();
      expect(spyApiCall.mock.calls[0][0]).toEqual(profile);

      done();
    });
  });

  it('should dispatch error for a good API call', (done) => {
    const profile = {
      id: 'u1',
      username: 'user1',
      displayName: 'User One',
      work: 'Web Developer',
      phone: '+65 8989 0991',
      timezone: 'Asia/Kuala_Lumpur',
      avatarUrl: 'https://picsum.photos/192/192',
    };
    const response = {
      ok: false,
      code: 400,
      message: 'Bad Request',
    };

    fetch.mockResponseOnce(JSON.stringify(response), { status: 400 });

    const store = createStore();
    const fn = actions.saveProfile(profile);
    const spy = jest.spyOn(store, 'dispatch');
    const spyApiCall = jest.spyOn(api, 'saveProfile');

    fn(store.dispatch).then(() => {
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls).toHaveLength(2);
      expect(spy.mock.calls[0][0]).toEqual(actions.action(ACTION_SAVE_PROFILE, ACTION_STATUS_PENDING));
      expect(spy.mock.calls[1][0]).toEqual(actions.action(ACTION_SAVE_PROFILE, ACTION_STATUS_ERROR, response));

      expect(spyApiCall).toHaveBeenCalled();
      expect(spyApiCall.mock.calls[0][0]).toEqual(profile);

      done();
    });
  });
});
