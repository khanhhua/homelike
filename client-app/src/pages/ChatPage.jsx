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
import { loadChannels, loadProfile } from '../store/actions';
import ChatterBadge from '../components/ChatterBadge';

let modalPromise;

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

  render() {
    const {
      dispatch, profile, channels, active,
    } = this.props;

    const { isModalVisible, modalDelegate } = this.state;

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
            <Col md={7}>
              <AppContext.Provider value={{
                dispatch, modalDelegate, profile, active,
              }}
              >
                <ChatDetail
                  channel={active.channel || null}
                  messages={active.messages || []}
                />
              </AppContext.Provider>
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
            Elit est explicabo ipsum eaque dolorem blanditiis doloribus sed id
            ipsam, beatae, rem fuga id earum? Inventore et facilis obcaecati.
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
