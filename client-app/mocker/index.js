let proxy = {
  // Priority processing.
  // apiMocker(app, path, option)
  // This is the option parameter setting for apiMocker
  // webpack-api-mocker@1.5.15 support
  _proxy: {
    proxy: {
      // '/sse/*': 'http://localhost:3838',
      '/sse/*': 'http://localhost:9999',
      '/api/v1/*': 'http://localhost:9999',
    },
    changeHost: true,
  },
};
if (process.env.REACT_APP_MOCK) {
  proxy = {
    ...proxy,
    ...{
      'POST /api/v1/auth/register': { ok: true},
      'POST /api/v1/auth/login': require('./auth.json'),
      'GET /api/v1/channels': require('./channels.json'),
      'GET /api/v1/channels/1': {
        ...require('./channel-1.json'),
        messages: require('./channel-1-messages'),
      },
      'GET /api/v1/channels/2': require('./channel-2.json'),
    },
  };
}

module.exports = proxy;
