import Immutable from 'immutable';

import { ACTION_FIND_USERS, ACTION_SELECT_CHANNEL } from './action-types';
import { ACTION_STATUS_SUCCESS } from './action-statuses';

export default (state = Immutable.Map(), action) => {
  if (action.status !== ACTION_STATUS_SUCCESS) {
    return state;
  }

  switch (action.type) {
    case ACTION_FIND_USERS: {
      const users = action.payload;
      return users.reduce((acc, item) => acc.set(item.id, Immutable.fromJS(item)), state);
    }
    case ACTION_SELECT_CHANNEL: {
      const { chatters: users } = action.payload;
      return users.reduce((acc, item) => acc.set(item.id, Immutable.fromJS(item)), state);
    }
    default:
      return state;
  }
};
