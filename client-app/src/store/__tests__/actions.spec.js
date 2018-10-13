/* eslint-env jest */

import * as actions from '../actions';
import createStore from '..';
import { ACTION_AUTHENTICATE, ACTION_LOAD_CHANNELS, ACTION_SELECT_CHANNEL } from '../action-types';
import { ACTION_STATUS_PENDING, ACTION_STATUS_SUCCESS } from '../action-statuses';
import getStreamer from '../streamer';

jest.mock('../streamer', () => (
  jest.fn().mockImplementation(() => {
    return { subscribe: () => {} };
  })
));

describe('action', () => {
  it('should convert params into action object', () => {
    expect(actions.action('a', 'b', 'c')).toEqual({
      type: 'a',
      status: 'b',
      payload: 'c',
    });
  });
})

describe('authenticate', () => {
  it('should give an auth token', (done) => {
    const authToken = 'abc';
    const userId = 'u1';
    const username = 'User 1';

    fetch.resetMocks();
    fetch.mockResponseOnce(JSON.stringify({
      authToken,
      username,
      id: userId,
    }));

    const store = createStore();
    const fn = actions.authenticate('john.doe@mailinator.com', 'p@ssword');
    const spy = jest.spyOn(store, 'dispatch');

    fn(store.dispatch).then(() => {
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls).toHaveLength(2);
      expect(spy.mock.calls[0][0]).toEqual(actions.action(ACTION_AUTHENTICATE, ACTION_STATUS_PENDING, undefined));
      expect(spy.mock.calls[1][0]).toEqual(actions.action(ACTION_AUTHENTICATE, ACTION_STATUS_SUCCESS, {
        authToken,
        username,
        id: userId,
      }));

      done();
    });
  });
});

describe('loadChannels', () => {
  it('should load channels', (done) => {
    const channels = [
      {
        id: '1',
        name: 'Channel 1',
        createdAt: '2018-10-01T00:00:00Z',
        lastMsgAt: '2018-10-01T00:00:00Z',
      },
      {
        id: '2',
        name: 'Channel 2',
        createdAt: '2018-10-02T00:00:00Z',
        lastMsgAt: '2018-10-02T00:10:00Z',
      }];

    fetch.resetMocks();
    fetch.mockResponseOnce(JSON.stringify(channels));

    const store = createStore();
    const fn = actions.loadChannels();
    const spy = jest.spyOn(store, 'dispatch');

    fn(store.dispatch).then(() => {
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls).toHaveLength(2);
      expect(spy.mock.calls[0][0]).toEqual(actions.action(ACTION_LOAD_CHANNELS, ACTION_STATUS_PENDING, undefined));
      expect(spy.mock.calls[1][0]).toEqual(actions.action(ACTION_LOAD_CHANNELS, ACTION_STATUS_SUCCESS, channels));

      done();
    });
  });
});

describe('selectChannel', () => {
  it('should select channel', (done) => {
    const channel = {
      id: '1',
      name: 'Channel 1',
      createdAt: '2018-10-01T00:00:00Z',
      lastMsgAt: '2018-10-01T00:00:00Z',
    };

    fetch.resetMocks();
    fetch.mockResponseOnce(JSON.stringify(channel));

    const store = createStore();
    const fn = actions.selectChannel(channel);
    const spy = jest.spyOn(store, 'dispatch');

    fn(store.dispatch).then(() => {
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls).toHaveLength(2);
      expect(spy.mock.calls[0][0]).toEqual(actions.action(ACTION_SELECT_CHANNEL, ACTION_STATUS_PENDING, channel));
      expect(spy.mock.calls[1][0]).toEqual(actions.action(ACTION_SELECT_CHANNEL, ACTION_STATUS_SUCCESS, channel));
      expect(getStreamer).toHaveBeenCalled();

      done();
    });
  });
});
