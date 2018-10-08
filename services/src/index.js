import http from 'http';

import Koa from 'koa';
import bodyParser from 'koa-bodyparser';

import SSE from 'sse';
import debug from 'debug';

import internalHandlers from './internal-handlers';
import { registerClient } from './sse-client';

const app = new Koa();
app.use(bodyParser());
internalHandlers(app);

const server = http.createServer(app.callback()); // eslint-disable-line
const sse = new SSE(server, {
  path: '/sse/*',
});

const dbg = debug('services');

sse.on('connection', (clientSocket) => {
  dbg('Connection inbound');
  registerClient(clientSocket);
});
server.listen(3838, () => {
  dbg('TODO: Join FabioLB');
});
