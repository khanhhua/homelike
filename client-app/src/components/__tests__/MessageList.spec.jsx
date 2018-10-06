/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import MessageList from '../MessageList';
import Message from '../Message';

describe('MessageList', () => {
  it('should render zero messages', () => {
    const wrapped = shallow(<MessageList messages={[]} />);
    expect(wrapped.find(Message)).toHaveLength(0);
  });

  it('should render one message', () => {
    const messages = [
      {
        id: 'm1',
        sender: 'u1',
        body: 'Message from user 1',
      }];

    const wrapped = shallow(
      <MessageList messages={messages} />);
    expect(wrapped.find(Message)).toHaveLength(1);
    expect(wrapped.find(Message).props()).toEqual({
      message: {
        id: 'm1',
        sender: 'u1',
        body: 'Message from user 1',
      },
    });
  });
});
