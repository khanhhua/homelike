import React from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import EditProfilePage from './pages/EditProfilePage';
import ProfilePage from './pages/ProfilePage';

export default () => (
  <div className="app">
    <Router>
      <Switch>
        <Route exact path="/" component={LoginPage} />
        <Route exact path="/channels" component={ChatPage} />
        <Route path="/channels/:channelId" component={ChatPage} />
        <Route path="/profile" component={EditProfilePage} />
        <Route path="/users/:userId" component={ProfilePage} />
      </Switch>
    </Router>
  </div>
);
