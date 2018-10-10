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
server.listen(3838, async () => {
  const CONSUL_HOST = process.env.CONSUL_HOST || 'localhost:8500';
  const SERVICE_ID = 'sse-connector-1';
  dbg(`Joining consul ${CONSUL_HOST}...`);

  const consul = Consul({ promisify: true });
  try {
    await consul.agent.service.register({
      name: 'sse-connector',
      id: SERVICE_ID,
      enableTagOverride: false,
      tags: [
        'urlprefix-/api/clients',
        'urlprefix-/api/chats',
        'urlprefix-/sse'],
      address: '192.168.0.186',
      port: 3838,
      check: {
        http: 'http://192.168.0.186:3838/health',
        interval: '15s',
      },
      notes: 'Simple SSE Connector check',
    });
    dbg('Joined successfully');
  } catch (e) {
    dbg(e);
  }
});
