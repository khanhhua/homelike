import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup, ControlLabel, FormControl, Grid, Row, Col, Button,
} from 'react-bootstrap';
import { connect } from 'react-redux';
import * as actions from '../store/actions';

import styles from './login-page.module.scss';

class LoginPage extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
  };

  state = {
    registering: 0,
    email: '',
    password: '',
    repassword: '',
  };

  render() {
    const {
      registering, email, password, repassword,
    } = this.state;
    const { dispatch } = this.props;

    return (
      <div className={styles['login-page']}>
        <Grid>
          <Row className="justify-content-md-center">
            <Col xs={12} md={5}>
              <h2>Welcome to Slack-alike</h2>
              <p>Where we developers come, talk and slack-alike</p>

              <div className={styles.form}>
                <FormGroup>
                  <ControlLabel>Email</ControlLabel>
                  <FormControl
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={({ target: { value } }) => this.setState({ email: value })}
                  />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Password</ControlLabel>
                  <FormControl
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={({ target: { value } }) => this.setState({ password: value })}
                  />
                </FormGroup>
                { registering === 1
                && (
                <FormGroup
                  validationState={(!!repassword && repassword !== password) ? 'error' : null}
                >
                  <ControlLabel>Confirm your password</ControlLabel>
                  <FormControl
                    type="password"
                    placeholder="Enter your password again"
                    value={repassword}
                    onChange={({ target: { value } }) => this.setState({ repassword: value })}
                  />
                  <FormControl.Feedback />
                </FormGroup>
                )}
                {registering === 0
                && (
                  <div className="text-center">
                    <Button
                      className="btn-light m-1"
                      onClick={() => this.setState({ registering: 1 })}
                    >
                      Register
                    </Button>
                    <Button
                      className="btn-primary m-1"
                      onClick={() => dispatch(actions.authenticate(email, password))}
                    >
                      Login
                    </Button>
                  </div>
                )}
                {registering === 1
                && (
                  <div className="text-center">
                    <Button
                      className="btn-primary m-1"
                      onClick={() => dispatch(actions.register(email, password))}
                      disabled={repassword !== password}
                    >
                      Register
                    </Button>
                    <Button
                      className="btn-light m-1"
                      onClick={() => this.setState({ registering: 0, repassword: '' })}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

export default connect(null, dispatch => ({ dispatch }))(LoginPage);
