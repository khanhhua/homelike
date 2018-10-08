const baseURL = process.env.REACT_APP_SSE_BASE_URL || 'http://localhost:3000/sse';

let instance;

class Streamer {
  eventSource = null;

  subscribe(channelId, opts, callback) { // eslint-disable-line
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    const es = new EventSource(`${baseURL}/channels/${channelId}`);

    es.onopen = () => {
      console.log('Opened');
    };

    es.addEventListener('message', (e) => {
      const { data } = e;
      console.log(e);

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
