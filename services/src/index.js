/* eslint-disable prefer-destructuring */
import { createServer } from 'http';

import Koa from 'koa';
import bodyParser from 'koa-bodyparser';

import SSE from 'sse';
import Consul from 'consul';
import debug from 'debug';

import internalHandlers from './internal-handlers';
import { registerClient } from './sse-client';

const app = new Koa();
app.use(bodyParser());
app.use(async (ctx, next) => {
  if (ctx.path === '/health') {
    ctx.body = 'OK';

    return;
  }
  next();
});
internalHandlers(app);

const server = createServer(app.callback()); // eslint-disable-line
const sse = new SSE(server, {
  path: '/sse/*',
  CORS: true,
  verifyRequest: null,
});

const dbg = debug('services');

sse.on('connection', (clientSocket, query) => {
  dbg('Connection inbound');
  registerClient(clientSocket, query);
});

const { CONSUL_HOSTNAME, CONSUL_PORT } = process.env;
const ADVERTISED_HOSTNAME = process.env.ADVERTISED_HOSTNAME;
const ADVERTISED_PORT = parseInt(process.env.ADVERTISED_PORT || '3838', 10);
const SERVICE_ID = process.env.SERVICE_ID;
if (!(ADVERTISED_HOSTNAME && ADVERTISED_PORT)) {
  process.exit(1);
}

server.listen(ADVERTISED_PORT, async () => {
  dbg(`Joining consul ${CONSUL_HOSTNAME} as ${SERVICE_ID}:${ADVERTISED_PORT}...`);

  const consul = Consul({ host: CONSUL_HOSTNAME, port: CONSUL_PORT, promisify: true });
  try {
    await consul.agent.service.register({
      name: 'sse-connector',
      id: SERVICE_ID,
      enableTagOverride: false,
      tags: [
        'urlprefix-/api/clients',
        'urlprefix-/api/chats',
        'urlprefix-/sse'],
      address: ADVERTISED_HOSTNAME,
      port: ADVERTISED_PORT,
      check: {
        http: `http://${ADVERTISED_HOSTNAME}:${ADVERTISED_PORT}/health`,
        interval: '15s',
      },
      notes: 'Simple SSE Connector check',
    });
    dbg('Joined successfully');
  } catch (e) {
    dbg(e);
  }
});
