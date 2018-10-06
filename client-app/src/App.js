import React, { Component } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import { connect } from 'react-redux';

class App extends Component {
  render() {
    return (
      <div className="app">
        <LoginPage />
        <ChatPage />
      </div>
    );
  }
}

const mapStateToProps = (state = {}) => {
  return state;
};
const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
