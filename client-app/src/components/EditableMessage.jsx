import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, ButtonGroup, Glyphicon } from 'react-bootstrap';
import TalkBox from './TalkBox';

import AppContext from '../AppContext';
import * as actions from '../store/actions';

export default class EditableMessage extends Component {
  static propTypes = {
    message: PropTypes.shape({
      id: PropTypes.string.isRequired,
      sender: PropTypes.string.isRequired,
      body: PropTypes.string.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      text: props.message.body,
      editMode: false,
    };
  }

  confirmBeforeRemoveMessage(dispatch, channelId, modalDelegate) { // eslint-disable-line
    modalDelegate.showModal().then(() => {
      const { message } = this.props;

      console.log('Removing message', message);
      dispatch(actions.removeMessage(channelId, message));
    }).catch(() => null);
  }

  render() {
    const { message } = this.props;
    const { text, editMode } = this.state;

    if (message.removed) {
      return (
        <div className="message media">
          <div className="media-body">
            <p className="text-center">
              <i className="text-muted">This message has been removed</i>
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="message media editable">
        <div className="media-left">
          <img
            alt="64x64"
            className="media-object thumbnail"
            src="https://picsum.photos/64/64"
            data-holder-rendered="true"
            style={{ width: 64, height: 64 }}
          />
        </div>
        <AppContext.Consumer>
          {({ dispatch, modalDelegate, active }) => (
            <div className="media-body">
              <h5 className="media-heading">{message.sender}</h5>
              <div className="text-muted">{message.createdAt}</div>
              {!editMode
              && (
                <>
                  <ButtonGroup className="pull-right">
                    <Button
                      onClick={() => this.setState({ editMode: true })}
                      bsStyle="link"
                      bsSize="xsmall"
                    >
                      <Glyphicon glyph="pencil" />
                    </Button>
                    <Button
                      onClick={() => this.confirmBeforeRemoveMessage(dispatch, active.channel.id, modalDelegate)}
                      bsStyle="danger"
                      bsSize="xsmall"
                    >
                      <Glyphicon glyph="trash" />
                    </Button>
                  </ButtonGroup>
                  <p>{message.body}</p>
                </>)
              }
              {editMode
              && (
                <TalkBox
                  text={text}
                  onComplete={() => this.setState({ editMode: false })}
                  onSend={updatedText => dispatch(actions.updateMessage(active.channel.id, message.id, updatedText))}
                />
              )}
            </div>
          )}
        </AppContext.Consumer>
      </div>
    );
  }
}
