import React from 'react';
import PropTypes from 'prop-types';

const Message = ({ message }) => (
  <div className="media">
    <div className="media-left">
      <img
        alt="64x64"
        className="media-object thumbnail"
        src="https://picsum.photos/64/64"
        data-holder-rendered="true"
        style={{ width: 64, height: 64 }}
      />
    </div>
    <div className="media-body">
      <h5 className="media-heading">{message.sender}</h5>
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
