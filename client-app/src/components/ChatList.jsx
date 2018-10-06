import React from 'react';
import PropTypes from 'prop-types';

import * as actions from '../store/actions';

const ChatList = ({ dispatch, channels }) => (
  <div className="chat-list">
    <h2>CHAT LIST</h2>
    <div className="chat-list-body channels">
      {channels.length === 0
      && <div data-test-id="message" className="alert alert-info">Empty</div>
      }

      {channels.map((channel) => {
        const c = channel;
        return (
          <div
            key={channel.id}
            className="channel"
            role="button"
            tabIndex={0}
            onClick={() => {
              dispatch(actions.selectChannel(c));
            }}
            onKeyDown={() => null}
          >
            {channel.name}
          </div>
        );
      })}
    </div>
  </div>
);

ChatList.propTypes = {
  dispatch: PropTypes.func.isRequired,
  channels: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
  })).isRequired,
};

export default ChatList;
