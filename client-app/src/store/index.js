import { applyMiddleware, compose, createStore } from 'redux';
import { combineReducers } from 'redux-immutable';
import Immutable from 'immutable';

import thunk from 'redux-thunk';

import auth from './auth';
import users from './users';
import chats from './chats';
import channels from './channels';
import active from './active';

const rootReducer = combineReducers({
  auth,
  users,
  channels,
  chats,
  active,
});

const initialState = Immutable.Map();
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose; // eslint-disable-line
export default () => createStore(rootReducer, initialState,
  composeEnhancers(applyMiddleware(thunk)));
