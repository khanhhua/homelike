import React from 'react';
import PropTypes from 'prop-types';
// import { Image } from 'react-bootstrap';

import AppContext from '../AppContext';
import MessageList from './MessageList';
import TalkBox from './TalkBox';

import * as actions from '../store/actions';
import ChatterBadge from './ChatterBadge';

import styles from './chat-detail.module.scss';

const ChatDetail = ({ channel, messages }) => (
  <div className={styles['chat-detail']}>
    {!channel
    && (
      <>
        <p>Choose a channel...</p>
      </>
    )}
    {!!channel
    && (
      <>
        <div className={styles['chat-meta']}>
          <div className={styles['chat-meta-chatters']}>
            {channel.chatters.map(chatter => <ChatterBadge key={chatter.id} {...chatter} />)}
          </div>
          <p className="text-muted">
            {`(${channel.chatters.length} members)`}
          </p>
        </div>
        <MessageList messages={messages} />
        <AppContext.Consumer>
          {({ dispatch }) => (
            <TalkBox className={styles['talk-box']} onSend={text => dispatch(actions.sendMessage(channel.id, text))} />
          )}
        </AppContext.Consumer>
      </>
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
