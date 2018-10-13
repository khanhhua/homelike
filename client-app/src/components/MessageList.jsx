import React from 'react';
import PropTypes from 'prop-types';

import AppContext from '../AppContext';
import Message from './Message';
import EditableMessage from './EditableMessage';

const MessageList = ({ messages }) => (
  <AppContext.Consumer>
    {({ profile }) => (
      <div className="message-list">
        {messages.map(message => (
          profile.id === message.sender
            ? <EditableMessage key={`message-${message.id}`} message={message} />
            : <Message key={`message-${message.id}`} message={message} />
        ))}
      </div>
    )}
  </AppContext.Consumer>
);

MessageList.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    sender: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
  })).isRequired,
};

export default MessageList;
