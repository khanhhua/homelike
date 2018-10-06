import { ACTION_LOAD_CHANNELS } from './action-types';

import * as api from './api';
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
