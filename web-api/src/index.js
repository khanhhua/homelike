import debug from 'debug';
import morgan from 'koa-morgan';
// Swagger documentation
import * as swagger from 'swagger2';
import { ui } from 'swagger2-koa';
import Consul from 'consul';

import makeApp from './app';
import { initDb } from './db';

const PORT = process.env.PORT || '8080';

const document = swagger.loadDocumentSync('./swagger/api.yaml');

const app = makeApp();
app.use(ui(document, '/swagger'));
app.use(morgan('combined'));

const dbg = debug('web-api');
Object.entries(process.env).forEach(([k, v]) => k.toUpperCase() === k && dbg(`${k}=${v}`));

const {
  CONSUL_HOSTNAME, CONSUL_PORT, ADVERTISED_HOSTNAME, SERVICE_ID,
} = process.env;
const ADVERTISED_PORT = parseInt(process.env.ADVERTISED_PORT || '8080', 10);

const clusterMode = !!(CONSUL_HOSTNAME && CONSUL_PORT && ADVERTISED_HOSTNAME && ADVERTISED_PORT);

if (!clusterMode) {
  console.info('Cluster mode requires CONSUL_HOSTNAME, CONSUL_PORT, ADVERTISED_HOSTNAME and ADVERTISED_PORT set');
}

Promise.all([
  initDb().then(() => { dbg('Database configuration done'); }),
]).then(() => {
  dbg('Initialization completed');

  app.listen(PORT, async () => {
    dbg(`Node environment: ${process.env.NODE_ENV}`);
    dbg(`Listening on port ${PORT}...`);

    if (clusterMode) {
      dbg(`Cluster mode: joining consul ${CONSUL_HOSTNAME} as ${SERVICE_ID}:${ADVERTISED_PORT}...`);

      const consul = Consul({ host: CONSUL_HOSTNAME, port: CONSUL_PORT, promisify: true });
      try {
        await consul.agent.service.register({
          name: 'web-api',
          id: SERVICE_ID,
          enableTagOverride: false,
          tags: [
            'urlprefix-/api/v1/auth',
            'urlprefix-/api/v1/channels',
            'urlprefix-/api/v1/messages'],
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
    }
  });
}).catch(() => {
  process.exit(1);
});
