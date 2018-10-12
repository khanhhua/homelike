import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { ListGroup, ListGroupItem } from 'react-bootstrap';
import * as actions from '../store/actions';

const ChatList = ({ dispatch, channels, active }) => (
  <div className="chat-list">
    {channels.length === 0
    && <div data-test-id="message" className="alert alert-info">Empty</div>
    }
    <ListGroup>
      {channels.map(channel => (
        <ListGroupItem
          key={channel.id}
          className={cx('text-left', { active: active && active.id === channel.id })}
          role="button"
          tabIndex={0}
          onClick={() => {
            dispatch(actions.selectChannel(channel));
          }}
          onKeyDown={() => null}
        >
          {channel.name}
        </ListGroupItem>
      ))}
    </ListGroup>
  </div>
);

ChatList.propTypes = {
  dispatch: PropTypes.func.isRequired,
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
