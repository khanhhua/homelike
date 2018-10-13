import Immutable from 'immutable';
import React, { Component } from 'react';
import {
  Button,
  Col, Grid, Modal, Row,
} from 'react-bootstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import AppContext from '../AppContext';

import ChatList from '../components/ChatList';
import ChatDetail from '../components/ChatDetail';
import { loadChannels, selectChannel, loadProfile } from '../store/actions';
import ChatterBadge from '../components/ChatterBadge';
import Welcome from '../components/Welcome';

let modalPromise;

class ChatPage extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    users: PropTypes.object.isRequired,
    profile: PropTypes.object.isRequired,
    channels: PropTypes.array.isRequired,
    activeChannelId: PropTypes.string,
    active: PropTypes.object,
  };

  static defaultProps = {
    active: null,
    activeChannelId: null,
  };

  constructor(props) {
    super(props);
    const { activeChannelId } = props;

    props.dispatch(loadProfile());
    props.dispatch(loadChannels());
    if (activeChannelId) {
      props.dispatch(selectChannel(activeChannelId));
    }

    this.state = {
      isModalVisible: false,
      modalDelegate: {
        showModal: () => {
          modalPromise = new Promise((resolve, reject) => {
            this.modalResolve = resolve;
            this.modalReject = reject;
          });
          this.setState({ isModalVisible: true });

          return modalPromise;
        },
      },
    };
  }

  handleHide = () => {
    this.modalReject();
    this.setState({ isModalVisible: false });
    modalPromise = null;
  };

  handleConfirm = () => {
    this.modalResolve();
    this.setState({ isModalVisible: false });
    modalPromise = null;
  };

  UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line
    const { activeChannelId: next } = nextProps;
    const { activeChannelId: prev } = this.props;
    if (next && next !== prev) {
      nextProps.dispatch(selectChannel(next));
    }
  }

  render() {
    const {
      dispatch, users, profile, channels, active,
    } = this.props;

    const { isModalVisible, modalDelegate } = this.state;

    return (
      <div className="chat-page">
        <Grid>
          <Row>
            <Col xs={12} sm={3} md={4} className="sidebar">
              <>
                {!!profile
                && (
                  <div className="user-badge">
                    <Link to="/profile">
                      <ChatterBadge displayName={profile.displayName} avatarUrl={profile.avatarUrl} />
                    </Link>
                  </div>
                )}
                <ChatList channels={channels} active={active && active.channel} dispatch={dispatch} />
              </>
            </Col>
            <Col xs={12} sm={9} md={8}>
              {!active
              && (
                <Welcome />
              )}
              {!!active
              && (
                <AppContext.Provider value={{
                  dispatch, modalDelegate, users, profile, active,
                }}
                >
                  <ChatDetail
                    channel={active.channel || null}
                    messages={active.messages || []}
                  />
                </AppContext.Provider>
              )}
            </Col>
          </Row>
        </Grid>

        <Modal
          show={isModalVisible}
          onHide={this.handleHide}
          container={this}
          aria-labelledby="contained-modal-title"
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title">
              Confirm
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure?
          </Modal.Body>
          <Modal.Footer>
            <Button bsStyle="primary" onClick={this.handleConfirm}>Yes</Button>
            <Button onClick={this.handleHide}>No</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = (state = Immutable.Map(), ownProps) => {
  const { match: { params: { channelId } } } = ownProps;

  return {
    auth: state.get('auth') ? state.get('auth').toJS() : null,
    profile: state.get('profile') ? state.get('profile').toJS() : null,
    users: state.get('users'),
    channels: state.get('channels').valueSeq().toJS(),
    activeChannelId: channelId,
    active: channelId ? {
      channel: channelId && state.getIn(['channels', channelId]) ? state.getIn(['channels', channelId]).toJS() : null,
      messages: channelId && state.getIn(['chats', channelId]) ? state.getIn(['chats', channelId]).toJS() : [],
    } : null,
  };
};
const mapDispatchToProps = dispatch => ({
  dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps, null,
  {
    pure: false,
    areStatesEqual(a, b) {
      debugger;
      return a.equals(b);
    },
  })(ChatPage);
