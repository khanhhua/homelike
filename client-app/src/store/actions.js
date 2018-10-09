import {
  ACTION_REGISTER,
  ACTION_AUTHENTICATE,
  ACTION_LOAD_CHANNELS,
  ACTION_SELECT_CHANNEL,
  ACTION_RECEIVE_MESSAGES,
  ACTION_SEND_TO_CHANNEL,
} from './action-types';

import * as api from './api';
import getStreamer from './streamer';
import { ACTION_STATUS_ERROR, ACTION_STATUS_PENDING, ACTION_STATUS_SUCESS } from './action-statuses';

function getChannelAnchor(channel) {
  return channel.messages && channel.messages.length
    ? channel.messages[channel.messages.length - 1].id
    : null;
}

export function action(type, status, payload) { return ({ type, status, payload }); }

export const register = (email, password) => async (dispatch) => {
  dispatch(action(ACTION_REGISTER, ACTION_STATUS_PENDING));

  try {
    const result = await api.register(email, password);
    if (result === true) {
      window.location.reload();
    } else {
      dispatch(action(ACTION_REGISTER, ACTION_STATUS_ERROR, result.errors));
    }
  } catch (e) {
    dispatch(action(ACTION_REGISTER, ACTION_STATUS_ERROR, e));
  }
};

export const authenticate = (email, password) => async (dispatch) => {
  dispatch(action(ACTION_AUTHENTICATE, ACTION_STATUS_PENDING));

  try {
    const result = await api.authenticate(email, password);
    const { authToken } = result;

    localStorage.setItem('authToken', authToken);
    dispatch(action(ACTION_AUTHENTICATE, ACTION_STATUS_SUCESS, result));
  } catch (e) {
    dispatch(action(ACTION_AUTHENTICATE, ACTION_STATUS_ERROR, e));
  }
};

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

export const sendMessage = (channelId, message) => async (dispatch) => {
  dispatch(action(ACTION_SEND_TO_CHANNEL, ACTION_STATUS_PENDING, { channelId, message }));

  try {
    const updatedMesssage = await api.sendMessage(channelId, message);
    dispatch(action(ACTION_SEND_TO_CHANNEL, ACTION_STATUS_SUCESS, updatedMesssage));
  } catch (e) {
    dispatch(action(ACTION_SEND_TO_CHANNEL, ACTION_STATUS_ERROR, e));
  }
};
