import Immutable from 'immutable';
import { ACTION_STATUS_SUCESS } from './action-statuses';
import { ACTION_LOAD_CHANNELS } from './action-types';

export default (state = Immutable.List(), action) => {
  if (action.status !== ACTION_STATUS_SUCESS) {
    return state;
  }

  switch (action.type) {
    case ACTION_LOAD_CHANNELS:
      return state.concat(action.payload);
    default: break;
  }

  return state;
};
