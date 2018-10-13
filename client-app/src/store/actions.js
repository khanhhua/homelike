import {
  push,
} from 'react-router-redux';

import {
  ACTION_REGISTER,
  ACTION_AUTHENTICATE,
  ACTION_LOAD_CHANNELS,
  ACTION_SELECT_CHANNEL,
  ACTION_RECEIVE_MESSAGES,
  ACTION_EDIT_MESSAGES,
  ACTION_REMOVE_MESSAGES,
  ACTION_SEND_TO_CHANNEL,
  ACTION_LOAD_PROFILE,
  ACTION_SAVE_PROFILE,
  ACTION_UPDATE_MESSAGE,
  ACTION_REMOVE_MESSAGE, ACTION_FIND_USERS,
} from './action-types';

import * as api from './api';
import getStreamer from './streamer';
import { ACTION_STATUS_ERROR, ACTION_STATUS_PENDING, ACTION_STATUS_SUCCESS } from './action-statuses';

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
      return;
    }

    dispatch(action(ACTION_REGISTER, ACTION_STATUS_ERROR, result.errors));
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
    dispatch(action(ACTION_AUTHENTICATE, ACTION_STATUS_SUCCESS, result));
    dispatch(push('/channels'));
  } catch (e) {
    dispatch(action(ACTION_AUTHENTICATE, ACTION_STATUS_ERROR, e));
  }
};

export const loadChannels = () => async (dispatch) => {
  dispatch(action(ACTION_LOAD_CHANNELS, ACTION_STATUS_PENDING));

  try {
    const channels = await api.loadChannels();
    dispatch(action(ACTION_LOAD_CHANNELS, ACTION_STATUS_SUCCESS, channels));
  } catch (e) {
    dispatch(action(ACTION_LOAD_CHANNELS, ACTION_STATUS_ERROR, e));
  }
};

export const selectChannel = channelId => async (dispatch, getState) => {
  dispatch(action(ACTION_SELECT_CHANNEL, ACTION_STATUS_PENDING, { id: channelId }));

  let updatedChannel;
  try {
    let anchor = 0; // getChannelAnchor(channel);
    updatedChannel = await api.loadChannel(channelId, { anchor });
    dispatch(action(ACTION_SELECT_CHANNEL, ACTION_STATUS_SUCCESS, updatedChannel));

    anchor = getChannelAnchor(updatedChannel);
    getStreamer().subscribe(channelId, { anchor },
      {
        async receiveCallback(err, messages) {
          if (err) {
            return;
          }
          dispatch(action(ACTION_RECEIVE_MESSAGES, ACTION_STATUS_SUCCESS, {
            id: channelId,
            messages,
          }));

          const state = getState();
          const existingUsers = state.get('users');

          const newUserIds = messages.reduce((userIds, { sender }) => {
            if (!existingUsers.has(sender)) {
              return userIds.concat(sender);
            }

            return userIds;
          }, []);

          if (newUserIds.length) {
            const newUsers = await api.findUsers(newUserIds);
            dispatch(action(ACTION_FIND_USERS, ACTION_STATUS_SUCCESS, newUsers));
          }
        },
        editCallback(err, messages) {
          if (err) {
            return;
          }
          dispatch(action(ACTION_EDIT_MESSAGES, ACTION_STATUS_SUCCESS, {
            id: channelId,
            messages,
          }));
        },
        removeCallback(err, messages) {
          if (err) {
            return;
          }
          dispatch(action(ACTION_REMOVE_MESSAGES, ACTION_STATUS_SUCCESS, {
            id: channelId,
            messages,
          }));
        },
      });
  } catch (e) {
    dispatch(action(ACTION_SELECT_CHANNEL, ACTION_STATUS_ERROR, e));
  }
};

export const sendMessage = (channelId, message) => async (dispatch) => {
  dispatch(action(ACTION_SEND_TO_CHANNEL, ACTION_STATUS_PENDING, { channelId, message }));

  try {
    const updatedMessage = await api.sendMessage(channelId, message);
    dispatch(action(ACTION_SEND_TO_CHANNEL, ACTION_STATUS_SUCCESS, updatedMessage));
  } catch (e) {
    dispatch(action(ACTION_SEND_TO_CHANNEL, ACTION_STATUS_ERROR, e));
  }
};

export const updateMessage = (channelId, messageId, message) => async (dispatch) => {
  dispatch(action(ACTION_UPDATE_MESSAGE, ACTION_STATUS_PENDING, { channelId, messageId, message }));

  try {
    const updatedMessage = await api.updateMessage(channelId, messageId, message);
    dispatch(action(ACTION_UPDATE_MESSAGE, ACTION_STATUS_SUCCESS, { id: channelId, messages: [updatedMessage] }));
  } catch (e) {
    dispatch(action(ACTION_UPDATE_MESSAGE, ACTION_STATUS_ERROR, e));
  }
};

export const removeMessage = (channelId, message) => async (dispatch) => {
  dispatch(action(ACTION_REMOVE_MESSAGE, ACTION_STATUS_PENDING, { channelId, message }));

  try {
    const result = await api.removeMessage(channelId, message.id);
    if (result) {
      dispatch(action(ACTION_REMOVE_MESSAGE, ACTION_STATUS_SUCCESS, { id: channelId, messages: [message] }));
    }
  } catch (e) {
    dispatch(action(ACTION_REMOVE_MESSAGE, ACTION_STATUS_ERROR, e));
  }
};

export const loadProfile = () => async (dispatch) => {
  dispatch(action(ACTION_LOAD_PROFILE, ACTION_STATUS_PENDING));

  try {
    const profile = await api.loadProfile();
    dispatch(action(ACTION_LOAD_PROFILE, ACTION_STATUS_SUCCESS, profile));
  } catch (e) {
    dispatch(action(ACTION_LOAD_PROFILE, ACTION_STATUS_ERROR, e));
  }
};

export const findUser = id => async (dispatch) => {
  dispatch(action(ACTION_FIND_USERS, ACTION_STATUS_PENDING));

  try {
    const users = await api.findUsers([id]);

    dispatch(action(ACTION_FIND_USERS, ACTION_STATUS_SUCCESS, users));
  } catch (e) {
    dispatch(action(ACTION_FIND_USERS, ACTION_STATUS_ERROR, e));
  }
};

export const saveProfile = profile => async (dispatch) => {
  dispatch(action(ACTION_SAVE_PROFILE, ACTION_STATUS_PENDING));

  try {
    const updatedProfile = await api.saveProfile(profile);
    dispatch(action(ACTION_SAVE_PROFILE, ACTION_STATUS_SUCCESS, updatedProfile));
  } catch (e) {
    dispatch(action(ACTION_SAVE_PROFILE, ACTION_STATUS_ERROR, e));
  }
};
