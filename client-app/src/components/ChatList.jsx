import React from 'react';
import PropTypes from 'prop-types';

const ChatList = ({ channels }) => (
  <div className="chat-list">
    <h2>CHAT LIST</h2>
    <div className="chat-list-body channels">
      {channels.length === 0
      && <div data-test-id="message" className="alert alert-info">Empty</div>
      }

      { channels.map(chat => (
        <div className="channel" key={chat.id}>{chat.name}</div>
      )) }
    </div>
  </div>
);

ChatList.propTypes = {
  channels: PropTypes.arrayOf.isRequired,
};

export default ChatList;
