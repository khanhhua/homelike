import React, { Component } from 'react';
import {
  FormGroup, ControlLabel, FormControl, Grid, Row, Col, Button,
} from 'react-bootstrap';
import AppContext from '../AppContext';
import * as actions from '../store/actions';

import styles from './login-page.module.scss';

export default class Login extends Component {
  render() {
    return (
      <div className={styles['login-page']}>
        <Grid>
          <Row className="justify-content-md-center">
            <Col xs={12} md={4}>
              <h2>Welcome to Slack-alike</h2>
              <p>Where we developers come, talk and slack-alike</p>

              <div className={styles.form}>
                <FormGroup>
                  <ControlLabel>Email</ControlLabel>
                  <FormControl
                    type="email"
                    placeholder="Enter your email"
                    inputRef={(node) => { this.email = node; }}
                  />
                </FormGroup>
                <AppContext.Consumer>
                  {({ dispatch }) => (
                    <Button
                      className="btn-primary"
                      onClick={() => dispatch(actions.authenticate(this.email.value))}
                    >
                      Login
                    </Button>
                  )}
                </AppContext.Consumer>
              </div>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}
