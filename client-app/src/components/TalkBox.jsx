import React from 'react';
import { Button } from 'react-bootstrap';

export default () => (
  <div className={'talk-box'}>
    <textarea rows={4}></textarea>
    <Button>Send</Button>
    <Button>Image</Button>
  </div>
);