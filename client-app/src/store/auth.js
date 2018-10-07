import Immutable from 'immutable';

import { ACTION_AUTHENTICATE } from './action-types';
import { ACTION_STATUS_SUCESS } from './action-statuses';

export default (state = null, action) => {
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
