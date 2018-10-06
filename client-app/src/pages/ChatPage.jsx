import React from 'react';
import { Col, Grid, Row } from 'react-bootstrap';
import ChatList from '../components/ChatList';
import ChatDetail from '../components/ChatDetail';

export default () => (
  <div className={'chat-page'}>
    <h1>CHAT</h1>

    <Grid>
      <Row>
        <Col md={4}>
          <ChatList />
        </Col>
        <Col md={8}>
          <ChatDetail />
        </Col>
      </Row>
    </Grid>
  </div>
);