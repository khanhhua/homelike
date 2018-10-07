import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { connect } from 'react-redux';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import { loadChannels } from './store/actions';

import AppContext from './AppContext';

class App extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
  };

  componentWillMount() {
    const { dispatch } = this.props;

    dispatch(loadChannels());
  }

  render() {
    return (
      <div className="app">
        <AppContext.Provider value={this.props}>
          <LoginPage />
          <ChatPage />
        </AppContext.Provider>
      </div>
    );
  }
}

const mapStateToProps = (state = {}) => {
  const active = state.get('active');

  return {
    users: state.get('users'),
    channels: state.get('channels').valueSeq().toJS(),
    active: {
      channel: active ? state.getIn(['channels', active]) : null,
      messages: active && state.getIn(['chats', active]) ? state.getIn(['chats', active]).toJS() : [],
    },
  };
};
const mapDispatchToProps = dispatch => ({
  dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
