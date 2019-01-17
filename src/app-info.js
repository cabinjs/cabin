const parseAppInfo = require('parse-app-info');

const appInfo = {};

parseAppInfo().then(app => {
  appInfo.app = app;
});

module.exports = appInfo;
