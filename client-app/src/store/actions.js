import {
  ACTION_LOAD_CHANNELS,
  ACTION_SELECT_CHANNEL,
  ACTION_RECEIVE_MESSAGES,
} from './action-types';

import * as api from './api';
import getStreamer from './streamer';
import { ACTION_STATUS_ERROR, ACTION_STATUS_PENDING, ACTION_STATUS_SUCESS } from './action-statuses';

const action = (type, status, payload) => ({ type, status, payload });

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
    const updatedChannel = await api.loadChannel(channel.id);
    dispatch(action(ACTION_SELECT_CHANNEL, ACTION_STATUS_SUCESS, updatedChannel));

    getStreamer().subscribe(channel.id, (err, messages) => {
      if (err) {
        return;
      }
      dispatch(action(ACTION_RECEIVE_MESSAGES, ACTION_STATUS_SUCESS, {
        channel,
        messages,
      }));
    });
  } catch (e) {
    dispatch(action(ACTION_SELECT_CHANNEL, ACTION_STATUS_ERROR, e));
  }
};
