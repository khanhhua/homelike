import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ChatList = ({ channels, active }) => (
  <div className="chat-list">
    {channels.length === 0
    && <div data-test-id="message" className="alert alert-info">Empty</div>
    }
    <ListGroup>
      {channels.map(channel => (
        <Link
          to={`/channels/${channel.id}`}
          replace
          key={channel.id}
          className={cx('text-left', 'list-group-item', { active: active && active.id === channel.id })}
          role="button"
          tabIndex={0}
          onKeyDown={() => null}
        >
          {channel.name}
        </Link>
      ))}
    </ListGroup>
  </div>
);

ChatList.propTypes = {
  active: PropTypes.object,
  channels: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
  })).isRequired,
};
ChatList.defaultProps = {
  active: 0,
};

export default ChatList;
