const proxy = {
  // Priority processing.
  // apiMocker(app, path, option)
  // This is the option parameter setting for apiMocker
  // webpack-api-mocker@1.5.15 support
  _proxy: {
    proxy: {
      '/repos/*': 'https://api.github.com/',
      '/:owner/:repo/raw/:ref/*': 'http://127.0.0.1:2018',
    },
    changeHost: true,
  },
  // =====================
  'GET /api/channels': require('./channels.json'),
  'GET /api/channels/1': {
    ...require('./channel-1.json'),
    messages: require('./channel-1-messages'),
  },
  'GET /api/channels/2': require('./channel-2.json'),
};
module.exports = proxy;
