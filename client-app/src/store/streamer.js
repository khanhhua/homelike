let instance;

class Streamer {
  timer = null;

  subscribe(channelId, opts, callback) { // eslint-disable-line
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    this.timer = setTimeout(() => {
      callback(null, [
        {
          id: `${Date.now()}`,
          sender: 'u2',
          body: 'Lorem ipsum',
        },
        {
          id: `${Date.now() + 1}`,
          sender: 'u1',
          body: 'Sit amet consecteur',
        }]);
    }, 2000);
  }
}

export default () => {
  if (!instance) {
    instance = new Streamer();
  }

  return instance;
};
