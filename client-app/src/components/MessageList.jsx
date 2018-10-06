import React from 'react';
import PropTypes from 'prop-types';

import Message from './Message';

const MessageList = ({ messages }) => (
  <div className="message-list">
    {messages.map(_item => (
      <Message />
    ))}
  </div>
);

MessageList.propTypes = {
  messages: PropTypes.arrayOf.isRequired,
};

export default MessageList;
