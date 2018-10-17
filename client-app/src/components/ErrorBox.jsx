import Immutable from 'immutable';
import { connect } from 'react-redux';
import { Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';
import React from 'react';

const ErrorBox = ({ error }) => (
  !!error
  && (
    <div>
      <Alert bsStyle="danger" closeLabel="x">{error}</Alert>
    </div>
  )
);

ErrorBox.propTypes = {
  error: PropTypes.string,
};

ErrorBox.defaultProps = {
  error: '',
};

const mapStateToProps = (state = Immutable.Map()) => ({
  error: state.getIn(['error']) ? state.getIn(['error']) : null,
});

export default connect(mapStateToProps)(ErrorBox);
