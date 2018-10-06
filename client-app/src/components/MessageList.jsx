import React from 'react';
import PropTypes from 'prop-types';

import Message from './Message';

const MessageList = ({ messages }) => (
  <div className="message-list">
    {messages.map(message => (
      <Message key={`message-${message.id}`} message={message} />
    ))}
  </div>
);

MessageList.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    sender: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
  })).isRequired,
};

export default MessageList;
