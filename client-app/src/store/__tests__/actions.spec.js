/* eslint-env jest */

import * as actions from '../actions';
import createStore from '..';
import { ACTION_LOAD_CHANNELS, ACTION_SELECT_CHANNEL } from '../action-types';
import { ACTION_STATUS_PENDING, ACTION_STATUS_SUCESS } from '../action-statuses';
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
      expect(spy.mock.calls[1][0]).toEqual(actions.action(ACTION_LOAD_CHANNELS, ACTION_STATUS_SUCESS, channels));

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
      expect(spy.mock.calls[1][0]).toEqual(actions.action(ACTION_SELECT_CHANNEL, ACTION_STATUS_SUCESS, channel));
      expect(getStreamer).toHaveBeenCalled();

      done();
    });
  });
});
