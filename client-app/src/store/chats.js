import Immutable from 'immutable';
import { ACTION_RECEIVE_MESSAGES } from './action-types';

export default (state = Immutable.Map(), action) => {
  switch (action.type) {
    case ACTION_RECEIVE_MESSAGES: {
      const { channel: { id: channelId }, messages } = action.payload;
      return state.updateIn([channelId], (value) => {
        if (value) {
          return value.concat(messages);
        }

        return Immutable.fromJS(messages);
      });
    }
    default:
      return state;
  }
};
