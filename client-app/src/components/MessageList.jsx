import React from 'react';
import Message from './Message';

export default (props) => (
  <div className={'message-list'}>
    {props.messages.map(item => (
      <Message />
    ))}
  </div>
);