/* eslint-env jest */
import React from 'react';
import { mount, shallow } from 'enzyme';
import * as actionTypes from '../../store/action-types';
import * as actionStatus from '../../store/action-statuses';

import ChatList from '../ChatList';

describe('ChatList', () => {
  it('should render zero channels', () => {
    const dispatch = jest.fn().mockName('mockedFunction');
    const wrapped = shallow(<ChatList channels={[]} dispatch={dispatch} />);
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

    const selectChannel = jest.fn().mockName('action');
    const dispatch = (/* AsyncFunc */) => {
      selectChannel({
          type: actionTypes.ACTION_SELECT_CHANNEL,
          status: actionStatus.ACTION_STATUS_SUCCESS,
          payload: channel});
    }
    const wrapped = shallow(<ChatList channels={[channel]} dispatch={dispatch} />);
    expect(wrapped.find('.channel')).toHaveLength(1);

    wrapped.find('.channel').simulate('click')
    expect(selectChannel).toHaveBeenCalled();
    expect(selectChannel.mock.calls[0][0]).toEqual({
      type: actionTypes.ACTION_SELECT_CHANNEL,
      status: actionStatus.ACTION_STATUS_SUCCESS,
      payload: channel});
  });
});
