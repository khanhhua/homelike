import React, { Fragment } from 'react';
import { Col, Grid, Row } from 'react-bootstrap';
import ChatList from '../components/ChatList';
import ChatDetail from '../components/ChatDetail';
import AppContext from '../AppContext';

export default () => (
  <div className="chat-page">
    <Grid>
      <Row>
        <Col md={4}>
          <AppContext.Consumer>
            {({ auth, channels, dispatch }) => (
              <Fragment>
                {!!auth
                && (
                <div className="user-badge">
                  {auth.username}
                </div>
                )}
                <ChatList channels={channels} dispatch={dispatch} />
              </Fragment>
            )}
          </AppContext.Consumer>
        </Col>
        <Col md={8}>
          <AppContext.Consumer>
            {({ active }) => (
              <ChatDetail
                channel={active.channel || null}
                messages={active.messages || []}
              />
            )}
          </AppContext.Consumer>
        </Col>
      </Row>
    </Grid>
  </div>
);
