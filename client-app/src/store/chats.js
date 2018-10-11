/* eslint-disable */

import Immutable from 'immutable';
import { ACTION_RECEIVE_MESSAGES, ACTION_SELECT_CHANNEL } from './action-types';
import { ACTION_STATUS_SUCESS } from './action-statuses';

export default (state = Immutable.Map(), action) => {
  if (action.status !== ACTION_STATUS_SUCESS) {
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
          const existingKeys = existingChats.reduce((acc, item) => acc.add(item.get('id')),
            Immutable.Set());

          return Immutable.fromJS(messages).reduce(({ chats, keys }, item) => {
            if (keys.has(item.get('id'))) {
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
