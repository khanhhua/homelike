import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import PropTypes from 'prop-types';

import cx from 'classnames';
import styles from './talk-box.module.scss';

export default class TalkBox extends Component {
  static propTypes = {
    onSend: PropTypes.func.isRequired,
  };

  state = {
    text: '',
  };

  render() {
    const { onSend } = this.props;
    const { text } = this.state;

    return (
      <div className={cx(styles['talk-box'], 'form-inline')}>
        <div className={cx(styles['form-group'], 'form-group')}>
          <textarea
            value={text}
            onChange={({ target: { value } }) => this.setState({ text: value })}
            className={cx(styles['form-control'], 'form-control')}
            rows={4}
          />
        </div>
        <Button
          className="btn-primary"
          onClick={() => {
            onSend(text).then(() => this.setState({ text: '' }));
          }}
        >
          Send
        </Button>
        <Button>Image</Button>
      </div>
    );
  }
}
