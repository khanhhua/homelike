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
});

const dbg = debug('services');

sse.on('connection', (clientSocket, query) => {
  dbg('Connection inbound');
  registerClient(clientSocket, query);
});

const CONSUL_URL = process.env.CONSUL_URL || 'localhost:8500';
const ADVERTISED_HOSTNAME = process.env.ADVERTISED_HOSTNAME;
const ADVERTISED_PORT = process.env.ADVERTISED_PORT;
if (!(ADVERTISED_HOSTNAME && ADVERTISED_PORT)) {
  process.exit(1);
}

server.listen(ADVERTISED_PORT, ADVERTISED_HOSTNAME, async () => {
  const SERVICE_ID = process.env.SERVICE_ID;
  dbg(`Joining consul ${CONSUL_URL} as ${SERVICE_ID}:${ADVERTISED_PORT}...`);

  const consul = Consul({ baseUrl: CONSUL_URL, promisify: true });
  try {
    await consul.agent.service.register({
      name: 'sse-connector',
      id: SERVICE_ID,
      enableTagOverride: false,
      tags: [
        'urlprefix-/api/clients',
        'urlprefix-/api/chats',
        'urlprefix-/sse'],
      address: '172.28.0.3',
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
