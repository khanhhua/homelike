import {
  ACTION_LOAD_CHANNELS,
  ACTION_SELECT_CHANNEL,
  ACTION_RECEIVE_MESSAGES,
} from './action-types';

import * as api from './api';
import getStreamer from './streamer';
import { ACTION_STATUS_ERROR, ACTION_STATUS_PENDING, ACTION_STATUS_SUCESS } from './action-statuses';

function getChannelAnchor(channel) {
  return channel.messages
    ? channel.messages[channel.messages.length - 1].id
    : null;
}

export function action(type, status, payload) { return ({ type, status, payload }); };

export const loadChannels = () => async (dispatch) => {
  dispatch(action(ACTION_LOAD_CHANNELS, ACTION_STATUS_PENDING));

  try {
    const channels = await api.loadChannels();
    dispatch(action(ACTION_LOAD_CHANNELS, ACTION_STATUS_SUCESS, channels));
  } catch (e) {
    dispatch(action(ACTION_LOAD_CHANNELS, ACTION_STATUS_ERROR, e));
  }
};

export const selectChannel = channel => async (dispatch) => {
  dispatch(action(ACTION_SELECT_CHANNEL, ACTION_STATUS_PENDING, channel));

  try {
    let anchor = getChannelAnchor(channel);
    const updatedChannel = await api.loadChannel(channel.id, { anchor });
    dispatch(action(ACTION_SELECT_CHANNEL, ACTION_STATUS_SUCESS, updatedChannel));

    anchor = getChannelAnchor(updatedChannel);
    getStreamer().subscribe(channel.id, { anchor }, (err, messages) => {
      if (err) {
        return;
      }
      dispatch(action(ACTION_RECEIVE_MESSAGES, ACTION_STATUS_SUCESS, {
        ...channel,
        messages,
      }));
    });
  } catch (e) {
    dispatch(action(ACTION_SELECT_CHANNEL, ACTION_STATUS_ERROR, e));
  }
};
