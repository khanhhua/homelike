import Immutable from 'immutable';
import { ACTION_STATUS_SUCCESS } from './action-statuses';
import { ACTION_LOAD_PROFILE, ACTION_SAVE_PROFILE } from './action-types';

const initialState = Immutable.Map({
  displayName: '',
  work: '',
  phone: '',
  timezone: '',
  avatarUrl: '',
});

export default (state = initialState, action) => {
  if (action.status !== ACTION_STATUS_SUCCESS) {
    return state;
  }

  switch (action.type) {
    case ACTION_LOAD_PROFILE:
    case ACTION_SAVE_PROFILE: {
      return Immutable.fromJS(action.payload);
    }
    default:
      return state;
  }
};
