import Immutable from 'immutable';
import { ACTION_RECEIVE_MESSAGES, ACTION_SELECT_CHANNEL } from './action-types';
import { ACTION_STATUS_ERROR } from './action-statuses';

export default (state = Immutable.Map(), action) => {
  if (action.status === ACTION_STATUS_ERROR) {
    return state;
  }

  switch (action.type) {
    case ACTION_SELECT_CHANNEL:
    case ACTION_RECEIVE_MESSAGES: {
      const { id: channelId, messages = [] } = action.payload;

      if (!messages.length) {
        return state;
      }

      return state.updateIn([channelId], (existingChats) => {
        if (existingChats) {
          const existingKeys = existingChats.reduce((acc, item) => acc.add(item.id),
            Immutable.Set());
          return messages.reduce(({ chats, keys }, item) => {
            if (keys.has(item.id)) {
              return { chats, keys };
            }

            return {
              keys: keys.add(item.id),
              chats: chats.push(item),
            };
          }, { keys: existingKeys, chats: existingChats }).chats;
        }

        return Immutable.fromJS(messages);
      });
    }
    default:
      return state;
  }
};
