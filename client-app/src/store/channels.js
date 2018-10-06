import Immutable from 'immutable';
import { ACTION_STATUS_SUCESS } from './action-statuses';
import { ACTION_LOAD_CHANNELS } from './action-types';

export default (state = Immutable.Map(), action) => {
  if (action.status !== ACTION_STATUS_SUCESS) {
    return state;
  }

  switch (action.type) {
    case ACTION_LOAD_CHANNELS: {
      const channels = action.payload;
      return state.update(values => channels.reduce((acc, item) => acc.set(item.id, item), values));
    }
    default: break;
  }

  return state;
};
