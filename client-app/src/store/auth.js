import Immutable from 'immutable';

import { ACTION_AUTHENTICATE } from './action-types';
import { ACTION_STATUS_ERROR, ACTION_STATUS_SUCCESS } from './action-statuses';

let initialState = Immutable.Map();

try {
  const authToken = localStorage.getItem('authToken');
  const [, encoded] = authToken.split('.');

  const { username } = JSON.parse(atob(encoded));
  initialState = Immutable.fromJS({ username });
} catch (e) {
  initialState = Immutable.Map();
}

export default (state = initialState, action) => {
  if (action.status === ACTION_STATUS_ERROR) {
    return state.set('error', action.payload);
  }
  if (action.status !== ACTION_STATUS_SUCCESS) {
    return state;
  }

  switch (action.type) {
    case ACTION_AUTHENTICATE:
      return Immutable.fromJS(action.payload);
    default:
      return state;
  }
};
