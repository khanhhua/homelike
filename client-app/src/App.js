import React from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';

export default () => (
  <div className="app">
    <Router>
      <Switch>
        <Route exact path="/" component={LoginPage} />
        <Route path="/channels" component={ChatPage} />
      </Switch>
    </Router>
  </div>
);
