import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import styles from './chat-detail.module.scss';

const ChatterBadge = ({ displayName, avatarUrl, className }) => (
  <div className={cx(styles['chatter-badge'], className)}>
    {!!avatarUrl
    && (
    <span
      className={cx('rounded-circle', styles.image)}
      style={{ backgroundImage: `url(${avatarUrl})` }}
    />
    )}
    {!avatarUrl
    && (
    <span
      className={cx('rounded-circle', styles.image, styles['stylish-text'])}
    >
      {displayName.charAt(0)}
    </span>
    )}
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
