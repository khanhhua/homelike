import React, { Component } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import PropTypes from 'prop-types';

import cx from 'classnames';
import styles from './talk-box.module.scss';

export default class TalkBox extends Component {
  static propTypes = {
    onSend: PropTypes.func.isRequired,
    onComplete: PropTypes.func,
    text: PropTypes.string,
  };

  static defaultProps = {
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

  render() {
    const { onSend, onComplete } = this.props;
    const { editMode, text } = this.state;

    return (
      <div className={cx(styles['talk-box'])}>
        <div className={cx(styles['form-group'], 'form-group')}>
          <textarea
            value={text}
            onChange={({ target: { value } }) => this.setState({ text: value })}
            className={cx(styles['form-control'], 'form-control')}
            rows={4}
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
