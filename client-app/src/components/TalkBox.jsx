import React, { Component } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import PropTypes from 'prop-types';

import cx from 'classnames';
import styles from './talk-box.module.scss';

export default class TalkBox extends Component {
  static propTypes = {
    className: PropTypes.string,
    onSend: PropTypes.func.isRequired,
    onComplete: PropTypes.func,
    text: PropTypes.string,
  };

  static defaultProps = {
    className: null,
    text: '',
    onComplete: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      text: props.text,
      editMode: !!props.onComplete,
    };
  }

  handleKeyDown = (e) => {
    if (!(e.keyCode === 13 && e.ctrlKey)) {
      return;
    }

    e.preventDefault();
    const { onSend } = this.props;
    const { text } = this.state;

    onSend(text).then(() => this.setState({ text: '' }));
  };

  render() {
    const { className, onSend, onComplete } = this.props;
    const { editMode, text } = this.state;

    return (
      <div className={cx(styles['talk-box'], className)}>
        <div className={cx(styles['form-group'], 'form-group')}>
          <textarea
            value={text}
            placeholder="Ctrl + Enter to send"
            onChange={({ target: { value } }) => this.setState({ text: value })}
            className={cx(styles['form-control'], 'form-control')}
            rows={4}
            onKeyDown={this.handleKeyDown}
          />
        </div>
        {editMode
        && (
          <ButtonGroup vertical className={styles['button-group']}>
            <Button
              className="btn-primary"
              onClick={() => {
                onSend(text).then(onComplete);
              }}
            >
              Update
            </Button>
            {editMode
            && (
              <Button
                className="btn-default"
                onClick={onComplete}
              >
                Cancel
              </Button>)}
          </ButtonGroup>
        )}
        {!editMode
        && (
          <ButtonGroup vertical className={styles['button-group']}>
            <Button
              className="btn-primary"
              onClick={() => {
                onSend(text).then(() => this.setState({ text: '' }));
              }}
            >
              Send
            </Button>
          </ButtonGroup>
        )}
      </div>
    );
  }
}
