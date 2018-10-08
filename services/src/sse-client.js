import URL from 'url';
import Route from 'route-parser';
import uuidV4 from 'uuid/v4';
import debug from 'debug';

const dbg = debug('services:sse-client');
const sockets = {};
const users = {};

const packet = (type, data) => {
  return `event: ${type}\ndata: ${data}\n\n`;
};

/**
 *
 * @param params
 * @return {{uuid: string, socket, userId}[]}
 */
export const query = (params = {}) => {
  const { userId = null } = params;
  if (!userId) {
    return Object.entries(sockets).map(([uuid, {socket, userId}]) => ({ uuid, socket, userId }));
  } else {
    return users[userId].map(({ socket, uuid }) => ({ uuid, socket, userId }));
  }
};

export const registerClient = (socket) => {
  const uuid = uuidV4();
  dbg(`Registering socket with process as #${uuid}`);

  const url = URL.parse(socket.req.url);
  const route = new Route('/sse/:userId');
  const { userId } = route.match(url.pathname);

  sockets[uuid] = {
    socket,
    userId,
  };

  if (userId in users) {
    users[userId].push({ socket, uuid });
  } else {
    users[userId] = [{ socket, uuid }];
  }


  socket.on('close', () => {
    dbg('Disconnecting...');
    const { userId } = sockets[uuid];
    const index = users[userId].findIndex(({ uuid: key }) => key === uuid)

    if (index !== -1) {
      users[userId].splice(index, 1);
    }

    delete sockets[uuid];
  });
  socket.send(packet('pong', uuid.toString()));
};

export const sendTo = (userId, message) => {
  const sockets = (users[userId] || []).map(({socket}) => socket);


  sockets.forEach((socket) => {
    socket.send(packet('chat', message));
  });
};
