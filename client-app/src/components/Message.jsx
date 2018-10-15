import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Image } from 'react-bootstrap';

import { Link } from 'react-router-dom';
import styles from './chat-detail.module.scss';

const Message = ({ displayName, avatarUrl, message }) => (
  message.removed
    ? (
      <div className={cx(styles.message, 'media')}>
        <div className="media-body">
          <p className="text-center">
            <i className="text-muted">This message has been removed</i>
          </p>
        </div>
      </div>
    )
    : (
      <div className={cx(styles.message, 'media')}>
        <div className="media-left">
          <Image className={cx(styles.thumbnail)} thumbnail src={avatarUrl || 'https://picsum.photos/192/192'} />
        </div>
        <div className="media-body">
          <h5 className="media-heading">
            <Link to={`/users/${message.sender}`}>
              {displayName}
            </Link>
          </h5>
          <div className="text-muted">{message.createdAt}</div>
          <p>{message.body}</p>
        </div>
      </div>
    )
);

Message.propTypes = {
  avatarUrl: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  message: PropTypes.shape({
    id: PropTypes.string.isRequired,
    sender: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
};

export default Message;
