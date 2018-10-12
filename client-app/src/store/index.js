import { applyMiddleware, compose, createStore } from 'redux';
import createHistory from 'history/createHashHistory';
import { combineReducers } from 'redux-immutable';
import { routerReducer, routerMiddleware } from 'react-router-redux';
import Immutable from 'immutable';

import thunk from 'redux-thunk';

import auth from './auth';
import users from './users';
import chats from './chats';
import channels from './channels';
import active from './active';
import profile from './profile';

const rootReducer = combineReducers({
  profile,
  auth,
  users,
  channels,
  chats,
  active,
  routing: routerReducer,
});

const historyMiddlware = routerMiddleware(createHistory());
const initialState = Immutable.Map();
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose; // eslint-disable-line
export default () => createStore(rootReducer, initialState,
  composeEnhancers(applyMiddleware(thunk, historyMiddlware)));
