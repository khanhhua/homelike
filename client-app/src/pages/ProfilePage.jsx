import Immutable from 'immutable';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup, ControlLabel, FormControl, Grid, Row, Col, Button,
} from 'react-bootstrap';

import { connect } from 'react-redux';
import { goBack } from 'react-router-redux';
import * as actions from '../store/actions';

import styles from './profile-page.module.scss';

class ProfilePage extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    profile: PropTypes.shape({
      displayName: PropTypes.string,
      work: PropTypes.string,
      phone: PropTypes.string,
      timezone: PropTypes.string,
      avatarUrl: PropTypes.string,
    }).isRequired,
  };

  state = {}

  constructor(props) {
    super(props);
    const { profile: { id } } = props;

    props.dispatch(actions.findUser(id));
  }

  render() {
    const {
      dispatch,
      profile: {
        displayName = '', work = '', phone = '', timezone = '', avatarUrl = '',
      },
    } = this.props;

    return (
      <div className={styles['profile-page']}>
        <Grid>
          <Row>
            <Col xs={12} md={12}>
              <h2>User profile</h2>
            </Col>
          </Row>
          <Row>
            <Col xs={12} md={8}>
              <div className={styles.form}>
                <FormGroup>
                  <ControlLabel>Display name</ControlLabel>
                  <FormControl componentClass="p">
                    {displayName}
                  </FormControl>
                </FormGroup>
                <FormGroup>
                  <ControlLabel>What I do (Optional)</ControlLabel>
                  <FormControl componentClass="p">
                    {work}
                  </FormControl>
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Phone (Optional)</ControlLabel>
                  <FormControl componentClass="p">
                    {phone}
                  </FormControl>
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Timezone</ControlLabel>
                  <FormControl componentClass="p">
                    {timezone}
                  </FormControl>
                </FormGroup>
              </div>
            </Col>
            <Col xs={12} md={4}>
              <ControlLabel>Profile photo</ControlLabel>
              <div className={styles.avatar}>
                <img className={styles['avatar-image']} src={avatarUrl} alt="Your avatar" />
              </div>
            </Col>
          </Row>
          <Row>
            <Col xs={12} md={8} className="text-center">
              <Button
                className="btn-default"
                onClick={() => dispatch(goBack())}
              >
                Back
              </Button>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

const mapStateToProps = (state = Immutable.Map(), ownProps) => {
  const { match: { params: { userId } } } = ownProps;
  return { profile: state.getIn(['users', userId]) ? state.getIn(['users', userId]).toJS() : { id: userId } };
};

export default connect(mapStateToProps, dispatch => ({ dispatch }), null,
  {
    pure: true,
  })(ProfilePage);
