import Immutable from 'immutable';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup, ControlLabel, FormControl, Grid, Row, Col, Button, HelpBlock,
} from 'react-bootstrap';
import Dropzone from 'react-dropzone';

import { connect } from 'react-redux';
import { goBack } from 'react-router-redux';
import * as actions from '../store/actions';

import styles from './profile-page.module.scss';

import timezones from './timezones.json';

function isRequired(value) {
  if (typeof value === 'undefined' || value === null || value.toString().trim() === '') {
    return 'Required';
  }

  return null;
}

function hasErrors(errors) {
  return !!Object.keys(errors).length;
}

class EditProfilePage extends Component {
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

    props.dispatch(actions.loadProfile());
  }

  UNSAFE_componentWillReceiveProps(nextProps) { // eslint-disable-line
    const { profile } = nextProps;
    this.setState({
      ...profile,
      errors: {},
    });
  }

  onSubmit = () => {
    const { dispatch, profile } = this.props;
    const {
      displayName,
      work,
      phone,
      timezone,
      avatarBlob,
    } = { ...profile, ...this.state };

    dispatch(actions.saveProfile({
      displayName,
      work,
      phone,
      timezone,
      avatarBlob,
    }));
  };

  onAvatarDrop = (acceptedFiles) => {
    const reader = new FileReader();
    reader.onload = () => {
      const [, mime, , data] = reader.result.split(/:|;|,/);
      const avatarUrl = reader.result;

      this.setState({
        avatarUrl,
        avatarBlob: {
          mime,
          data,
        },
      });
    };

    reader.readAsDataURL(acceptedFiles[0]);
  };

  formHandler(fieldName, errorCheck = () => null) {
    return ({ target: { value } }) => {
      const error = errorCheck(value);
      if (!error) {
        this.setState({ [fieldName]: value });
      } else {
        this.setState({
          [fieldName]: value,
          errors: {
            [`${fieldName}`]: error,
          },
        });
      }
    };
  }

  render() {
    const {
      dispatch,
    } = this.props;

    const {
      errors = {}, displayName = '', work = '', phone = '', timezone = '', avatarUrl = '',
    } = this.state;

    return (
      <div className={styles['profile-page']}>
        <Grid>
          <Row>
            <Col xs={12} md={12}>
              <h2>Edit your profile</h2>
            </Col>
          </Row>
          <Row>
            <Col xs={12} md={8}>
              <div className={styles.form}>
                <FormGroup validationState={errors.displayName ? 'error' : null}>
                  <ControlLabel>Display name</ControlLabel>
                  <FormControl
                    type="text"
                    maxLength={20}
                    placeholder="Enter your display name"
                    value={displayName}
                    onChange={this.formHandler('displayName', isRequired)}
                  />
                  {!!errors.displayName
                  && <HelpBlock>{errors.displayName}</HelpBlock>
                  }
                </FormGroup>
                <FormGroup>
                  <ControlLabel>What I do (Optional)</ControlLabel>
                  <FormControl
                    type="text"
                    maxLength={20}
                    placeholder="Enter your work description"
                    value={work}
                    onChange={this.formHandler('work')}
                  />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Phone (Optional)</ControlLabel>
                  <FormControl
                    type="text"
                    maxLength={20}
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={this.formHandler('phone')}
                  />
                </FormGroup>
                <FormGroup validationState={errors.timezone ? 'error' : null}>
                  <ControlLabel>Timezone</ControlLabel>
                  <FormControl
                    componentClass="select"
                    type="text"
                    placeholder="Set your timezone"
                    value={timezone}
                    onChange={this.formHandler('timezone', isRequired)}
                  >
                    {timezones.map(([value, label]) => (<option key={value} value={value}>{label}</option>))}
                  </FormControl>
                  {!!errors.timezone
                  && <HelpBlock>{errors.timezone}</HelpBlock>
                  }
                </FormGroup>
              </div>
            </Col>
            <Col xs={12} md={4}>
              <ControlLabel>Profile photo</ControlLabel>
              <Dropzone maxfiles={1} accept="image/*" onDrop={this.onAvatarDrop}>
                <div className={styles.avatar}>
                  <img className={styles['avatar-image']} src={avatarUrl} alt="Your avatar" />
                </div>
              </Dropzone>
            </Col>
          </Row>
          <Row>
            <Col xs={12} md={8} className="text-center">
              <Button
                className="btn-primary"
                disabled={hasErrors(errors)}
                onClick={this.onSubmit}
              >
                Save Changes
              </Button>
              <Button
                className="btn-default"
                onClick={() => dispatch(goBack())}
              >
                Cancel
              </Button>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

const mapStateToProps = (state = Immutable.Map()) => (
  { profile: state.get('profile') ? state.get('profile').toJS() : {} }
);

export default connect(mapStateToProps, dispatch => ({ dispatch }))(EditProfilePage);
