/* eslint-disable */

import Immutable from 'immutable';
import {
  ACTION_EDIT_MESSAGES,
  ACTION_RECEIVE_MESSAGES,
  ACTION_REMOVE_MESSAGES,
  ACTION_SELECT_CHANNEL,
  ACTION_UPDATE_MESSAGE,
  ACTION_REMOVE_MESSAGE,
} from './action-types';
import { ACTION_STATUS_SUCCESS } from './action-statuses';

export default (state = Immutable.Map(), action) => {
  if (action.status !== ACTION_STATUS_SUCCESS) {
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
    case ACTION_EDIT_MESSAGES: {
      const { id: channelId, messages = [] } = action.payload;
      return state.updateIn([channelId], (existingChats) => {
        return messages.reduce((chats, message) =>
          chats.set(chats.findIndex(item => item.get('id') === message.id), Immutable.fromJS(message)),
          existingChats)
      });
    }
    case ACTION_REMOVE_MESSAGES: {
      const { id: channelId, messages = [] } = action.payload;
      return state.updateIn([channelId], (existingChats) => {
        return messages.reduce((chats, message) => {
          const index = chats.findIndex(item => item.get('id') === message.id);
          return chats.set(index, chats.get(index).set('removed', true));
        },
        existingChats);
      });
    }
    case ACTION_UPDATE_MESSAGE: {
      const { id: channelId, messages = [] } = action.payload;
      return state.updateIn([channelId], (existingChats) => {
        return messages.reduce((chats, message) =>
            chats.set(chats.findIndex(item => item.get('id') === message.id), Immutable.fromJS(message)),
          existingChats)
      });
    }
    case ACTION_REMOVE_MESSAGE: {
      const { id: channelId, messages = [] } = action.payload;
      return state.updateIn([channelId], (existingChats) => {
        return messages.reduce((chats, message) => {
            const index = chats.findIndex(item => item.get('id') === message.id);
            return chats.set(index, chats.get(index).set('removed', true));
          },
          existingChats);
      });
    }
    default:
      return state;
  }
};
