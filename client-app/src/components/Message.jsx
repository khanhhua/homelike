import React from 'react';
import PropTypes from 'prop-types';

const Message = ({ message }) => (
  <div className="message media">
    <img className="mr-3" src="https://picsum.photos/64/64" alt="" />
    <div className="media-body">
      <h5 className="mt-0">{message.sender}</h5>
      <p>{message.body}</p>
    </div>
  </div>);

Message.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.string.isRequired,
    sender: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
  }).isRequired,
};

export default Message;
