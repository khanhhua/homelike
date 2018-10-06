/* eslint-env jest */
import React from 'react';
import { shallow } from 'enzyme';

import ChatDetail from '../ChatDetail';
import MessageList from '../MessageList';

describe('ChatDetail', () => {
  it('should render zero messages', () => {
    const dispatch = jest.fn().mockName('mockedFunction');
    const channel = {
      id: '1',
      name: 'Channel 1',
      chatters: [
        {
          id: 'u1',
          name: 'User One',
        },
        {
          id: 'u2',
          name: 'User Two',
        },
      ],
      createdAt: '2018-10-01T00:00:00Z',
      lastMsgAt: '2018-10-01T00:00:00Z',
    };
    const wrapped = shallow(<ChatDetail channel={channel} messages={[]} dispatch={dispatch} />);
    expect(wrapped.find(MessageList)).toHaveLength(1);
  });

  it('should render one message', () => {
    const dispatch = jest.fn().mockName('mockedFunction');
    const channel = {
      id: '1',
      name: 'Channel 1',
      chatters: [
        {
          id: 'u1',
          name: 'User One',
        },
        {
          id: 'u2',
          name: 'User Two',
        },
      ],
      createdAt: '2018-10-01T00:00:00Z',
      lastMsgAt: '2018-10-01T00:00:00Z',
    };
    const messages = [
      {
        id: 'm1',
        sender: 'u1',
        body: 'Message from user 1',
      }];

    const wrapped = shallow(
      <ChatDetail
        channel={channel}
        messages={messages}
        dispatch={dispatch}
      />);
    expect(wrapped.find(MessageList)).toHaveLength(1);
    expect(wrapped.find(MessageList).props()).toEqual({ messages });
  });
});
