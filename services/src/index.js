import Koa from 'koa';
import http from 'http';
import socketIO from 'socket.io';
import debug from 'debug';

const app = new Koa();
const server = http.createServer(app.callback()); // eslint-disable-line
const io = socketIO(server, {
  path: '/ws',
  serveClient: true,
});

const dbg = debug('services');

io.on('connection', () => {
  dbg('Connection inbound');
});
server.listen(3838, () => {
  dbg('TODO: Join FabioLB');
});
