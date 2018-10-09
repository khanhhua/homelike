const baseURL = process.env.REACT_APP_SSE_BASE_URL || 'http://localhost:3000/sse';

let instance;

class Streamer {
  eventSource = null;

  subscribe(channelId, opts, callback) {
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

    es.addEventListener('chat', (e) => {
      const { data: raw } = e;
      const data = JSON.parse(raw);
      console.debug('Streamer:on(chat)', data);

      if (Array.isArray(data)) {
        callback(null, data);
      } else {
        callback(null, [data]);
      }
    });

    this.eventSource = es;
  }
}

export default () => {
  if (!instance) {
    instance = new Streamer();
  }

  return instance;
};
