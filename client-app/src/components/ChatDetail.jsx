import React from 'react';
import MessageList from './MessageList';
import TalkBox from './TalkBox';

export default () => (
  <div className={'chat-detail'}>
    <h2>CHAT DETAIL</h2>

    <div>
      <div className={'chat-meta'}>
        <h3>#general</h3>
        <span>32 members</span>
      </div>
    </div>
    <MessageList messages={[1,2,3]} />
    <TalkBox />
  </div>
);