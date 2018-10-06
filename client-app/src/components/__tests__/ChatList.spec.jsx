/* eslint-env jest */
import React from 'react';
import { mount, shallow } from 'enzyme';

import ChatList from '../ChatList';

describe('ChatList', () => {
  it('should render zero channels', () => {
    const wrapped = shallow(<ChatList channels={[]} />);
    expect(wrapped.find('.channel')).toHaveLength(0);
    expect(wrapped.find('[data-test-id="message"]')).toHaveLength(1);

  });

  it('should render one channel', () => {
    const channel = {
      id: '1',
      name: 'Channel 1',
      createAt: '2018-10-01T00:00:00Z',
      lastMsgAt: '2018-10-01T00:10:00Z',
    }

    const wrapped = shallow(<ChatList channels={[channel]} />);
    expect(wrapped.find('.channel')).toHaveLength(1);
  });
});
