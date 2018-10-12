import React from 'react';
import PropTypes from 'prop-types';
import { Image } from 'react-bootstrap';
import cx from 'classnames';

import styles from './chat-detail.module.scss';

const ChatterBadge = ({ displayName, avatarUrl, className }) => (
  <div className={cx(styles['chatter-badge'], className)}>
    <Image src={avatarUrl} className={cx('rounded-circle', styles.image)} />
    <span>{displayName}</span>
  </div>
);
ChatterBadge.propTypes = {
  className: PropTypes.string,
  displayName: PropTypes.string,
  avatarUrl: PropTypes.string,
};
ChatterBadge.defaultProps = {
  className: '',
  displayName: '',
  avatarUrl: '',
};

export default ChatterBadge;
