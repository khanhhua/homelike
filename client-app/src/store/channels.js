import Immutable from 'immutable';
import { ACTION_STATUS_SUCCESS } from './action-statuses';
import { ACTION_LOAD_CHANNELS, ACTION_RECEIVE_MESSAGES, ACTION_SELECT_CHANNEL } from './action-types';

export default (state = Immutable.Map(), action) => {
  if (action.status !== ACTION_STATUS_SUCCESS) {
    return state;
  }

  switch (action.type) {
    case ACTION_LOAD_CHANNELS: {
      const channels = action.payload;
      return state.update(values => channels.reduce((acc, item) => acc.set(item.id, Immutable.fromJS(item)), values));
    }
    case ACTION_SELECT_CHANNEL: {
      const channel = action.payload;
      return state.set(channel.id, Immutable.fromJS(channel));
    }
    case ACTION_RECEIVE_MESSAGES: {
      const { id: channelId, messages = [] } = action.payload;
      return state.updateIn([channelId, 'chatters'], existingChatters => messages.reduce((chatters, { sender }) => {
        if (chatters.findIndex(item => item.get('id') === sender) === -1) {
          return chatters.push(Immutable.fromJS({ id: sender }));
        }
        return chatters;
      }, existingChatters));
    }
    default: break;
  }

  return state;
};
