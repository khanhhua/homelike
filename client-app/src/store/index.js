import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import users from './users';
import chats from './chats';
import thunk from 'redux-thunk';

const rootReducer = combineReducers({
  users,
  chats
});

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
export default () => createStore(rootReducer, {}, composeEnhancers(applyMiddleware(thunk)))

