import React from 'react';
import PropTypes from 'prop-types';
import Responsive from 'react-responsive';
import cx from 'classnames';

import {
  ListGroup, DropdownButton, MenuItem, FormGroup, ControlLabel,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Mobile = props => <Responsive {...props} maxWidth={767} />;
const Tablet = props => <Responsive {...props} minWidth={768} maxWidth={991} />;
const Desktop = props => <Responsive {...props} minWidth={992} />;

const Internal = ({ channels, active }) => ( // eslint-disable-line
  <ListGroup>
    <Link
      to="/channels"
      replace
      className={cx('text-left', 'list-group-item', { active: !active })}
      role="button"
      tabIndex={0}
      onKeyDown={() => null}
    >
      Welcome
    </Link>
    {channels.map(channel => (
      <Link
        to={`/channels/${channel.id}`}
        replace
        key={channel.id}
        className={cx('text-left', 'list-group-item', { active: active && active.id === channel.id })}
        role="button"
        tabIndex={0}
        onKeyDown={() => null}
      >
        {channel.name}
      </Link>
    ))}
  </ListGroup>
);

const ChatList = ({ channels, active }) => (
  <div className="chat-list">
    <Desktop>
      <Internal {...{ channels, active }} />
    </Desktop>
    <Tablet>
      <Internal {...{ channels, active }} />
    </Tablet>
    <Mobile>
      <FormGroup>
        <ControlLabel>Goto:</ControlLabel>
        <DropdownButton title={(active && active.name) || 'Welcome'} bsSize="small">
          <MenuItem active={!active}>
            <Link to="/channels" replace>Welcome</Link>
          </MenuItem>
          {channels.map(channel => (
            <MenuItem key={channel.id} active={active && active.id === channel.id}>
              <Link to={`/channels/${channel.id}`}>
                {channel.name}
              </Link>
            </MenuItem>
          ))}
        </DropdownButton>
      </FormGroup>
    </Mobile>
  </div>
);

ChatList.propTypes = {
  active: PropTypes.object,
  channels: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
  })).isRequired,
};
ChatList.defaultProps = {
  active: 0,
};

export default ChatList;
