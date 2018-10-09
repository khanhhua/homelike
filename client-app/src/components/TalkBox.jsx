import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

export default class TalkBox extends Component {
  static propTypes = {
    onSend: PropTypes.func.isRequired,
  };

  render() {
    const { onSend } = this.props;

    return (
      <div className="talk-box form-inline">
        <div className="form-group">
          <textarea
            ref={(node) => {
              this.textarea = node;
            }}
            className="form-control"
            rows={4}
          />
        </div>
        <Button
          className="btn-primary"
          onClick={() => {
            console.log(onSend);
            onSend(this.textarea.value);
          }}
        >
          Send
        </Button>
        <Button>Image</Button>
      </div>
    );
  }
}
