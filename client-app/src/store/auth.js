import Immutable from 'immutable';

import { ACTION_AUTHENTICATE } from './action-types';
import { ACTION_STATUS_SUCESS } from './action-statuses';

let initialState = null;
const authToken = localStorage.getItem('authToken');
const [, encoded] = authToken.split('.');

try {
  const { username } = JSON.parse(atob(encoded));
  initialState = Immutable.fromJS({ username });
} catch (e) {
  initialState = null;
}

export default (state = initialState, action) => {
  if (action.status !== ACTION_STATUS_SUCESS) {
    return state;
  }

  switch (action.type) {
    case ACTION_AUTHENTICATE:
      return Immutable.fromJS(action.payload);
    default:
      return state;
  }
};
