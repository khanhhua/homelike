import React, { Component } from 'react';
import { Col, Grid, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import AppContext from '../AppContext';

import ChatList from '../components/ChatList';
import ChatDetail from '../components/ChatDetail';
import { loadChannels } from '../store/actions';

class ChatPage extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    channels: PropTypes.array.isRequired,
    active: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    props.dispatch(loadChannels()); // eslint-disable-line
  }

  render() {
    const {
      dispatch, auth, channels, active,
    } = this.props;

    return (
      <div className="chat-page">
        <Grid>
          <Row>
            <Col md={3}>
              <>
                {!!auth
                && (
                  <div className="user-badge">
                    {auth.username}
                  </div>
                )}
                <ChatList channels={channels} dispatch={dispatch} />
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

const mapStateToProps = (state = {}) => {
  const active = state.get('active');

  return {
    auth: state.get('auth') ? state.get('auth').toJS() : null,
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

export default connect(mapStateToProps, mapDispatchToProps)(ChatPage);
