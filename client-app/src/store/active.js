import { ACTION_STATUS_ERROR } from './action-statuses';
import { ACTION_SELECT_CHANNEL } from './action-types';

export default (state = 0, action) => {
  if (action.status === ACTION_STATUS_ERROR) {
    return state;
  }

  switch (action.type) {
    case ACTION_SELECT_CHANNEL: {
      const channelId = action.payload;
      return channelId;
    }
    default: break;
  }

  return state;
};
