import Immutable from 'immutable';
import React, { Component } from 'react';
import { Col, Grid, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import AppContext from '../AppContext';

import ChatList from '../components/ChatList';
import ChatDetail from '../components/ChatDetail';
import { loadChannels, loadProfile } from '../store/actions';
import ChatterBadge from '../components/ChatterBadge';

class ChatPage extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    profile: PropTypes.object.isRequired,
    channels: PropTypes.array.isRequired,
    active: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    props.dispatch(loadChannels());
    props.dispatch(loadProfile());
  }

  render() {
    const {
      dispatch, profile, channels, active,
    } = this.props;

    return (
      <div className="chat-page">
        <Grid>
          <Row>
            <Col md={3}>
              <>
                {!!profile
                && (
                  <div className="user-badge">
                    <Link to="/profile">
                      <ChatterBadge displayName={profile.username} avatarUrl={profile.avatarUrl} />
                    </Link>
                  </div>
                )}
                <ChatList channels={channels} active={active.channel} dispatch={dispatch} />
              </>
            </Col>
            <Col md={9}>
              <AppContext.Provider value={{ dispatch }}>
                <ChatDetail
                  channel={active.channel || null}
                  messages={active.messages || []}
                />
              </AppContext.Provider>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

const mapStateToProps = (state = Immutable.Map()) => {
  const active = state.get('active');

  return {
    auth: state.get('auth') ? state.get('auth').toJS() : null,
    profile: state.get('profile') ? state.get('profile').toJS() : null,
    users: state.get('users'),
    channels: state.get('channels').valueSeq().toJS(),
    active: {
      channel: active ? state.getIn(['channels', active]).toJS() : null,
      messages: active && state.getIn(['chats', active]) ? state.getIn(['chats', active]).toJS() : [],
    },
  };
};
const mapDispatchToProps = dispatch => ({
  dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(ChatPage);
