const baseURL = process.env.REACT_APP_SSE_BASE_URL || 'http://localhost:3000/sse';

let instance;

class Streamer {
  eventSource = null;

  subscribe(channelId, opts, { receiveCallback = null, editCallback = null, removeCallback = null }) {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    console.log(`Subscribing to channel ${channelId}`); // eslint-disable-line

    const es = new EventSource(`${baseURL}/channels/${channelId}`);

    es.onopen = () => {
      console.debug('Opened');
    };

    es.addEventListener('pong', (e) => {
      console.info(`Connection UUID: ${e.data}`);
    });

    if (typeof receiveCallback === 'function') {
      es.addEventListener('chat', (e) => {
        const { data: raw } = e;
        const data = JSON.parse(raw);
        console.debug('Streamer:on(chat)', data);

        if (Array.isArray(data)) {
          receiveCallback(null, data);
        } else {
          receiveCallback(null, [data]);
        }
      });
    }

    if (typeof editCallback === 'function') {
      es.addEventListener('chat.edit', (e) => {
        const { data: raw } = e;
        const data = JSON.parse(raw);
        console.debug('Streamer:on(chat.edit)', data);

        if (Array.isArray(data)) {
          editCallback(null, data);
        } else {
          editCallback(null, [data]);
        }
      });
    }

    if (typeof removeCallback === 'function') {
      es.addEventListener('chat.remove', (e) => {
        const { data: raw } = e;
        const data = JSON.parse(raw);
        console.debug('Streamer:on(chat.remove)', data);

        if (Array.isArray(data)) {
          removeCallback(null, data);
        } else {
          removeCallback(null, [data]);
        }
      });
    }

    this.eventSource = es;
  }
}

export default () => {
  if (!instance) {
    instance = new Streamer();
  }

  return instance;
};
