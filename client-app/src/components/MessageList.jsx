import React from 'react';
import PropTypes from 'prop-types';

import AppContext from '../AppContext';
import Message from './Message';
import EditableMessage from './EditableMessage';

const userLookup = (users, id, ...propPath) => users.getIn([id, ...propPath]);

const MessageList = ({ messages }) => (
  <AppContext.Consumer>
    {({ profile, users }) => (
      <div className="message-list">
        {messages.map(message => (
          profile.id === message.sender
            ? (
              <EditableMessage
                key={`message-${message.id}`}
                avatarUrl={userLookup(users, message.sender, 'avatarUrl')}
                displayName={userLookup(users, message.sender, 'displayName')}
                message={message}
              />
            )
            : (
              <Message
                key={`message-${message.id}`}
                avatarUrl={userLookup(users, message.sender, 'avatarUrl')}
                displayName={userLookup(users, message.sender, 'displayName')}
                message={message}
              />
            )
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
