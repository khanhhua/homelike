import React from 'react';
import PropTypes from 'prop-types';
import MessageList from './MessageList';
import TalkBox from './TalkBox';

const ChatDetail = ({ channel, messages }) => (
  <div className="chat-detail">
    {!channel
    && (
      <React.Fragment>
        <p>Choose a channel...</p>
      </React.Fragment>
    )}
    {!!channel
    && (
      <React.Fragment>
        <div className="chat-meta">
          <h3>
            {channel.name}
            &nbsp;#
            {channel.id}
          </h3>
          <span>32 members</span>
        </div>
        <MessageList messages={messages} />
        <TalkBox />
      </React.Fragment>
    )}
  </div>
);

ChatDetail.propTypes = {
  channel: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }),
  messages: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    sender: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
  })),
};
ChatDetail.defaultProps = {
  channel: null,
  messages: [],
};

export default ChatDetail;
