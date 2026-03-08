// Metro configuration with fixed port to avoid freeport-async overflow on newer Node versions.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.server = {
  ...config.server,
  port: Number(process.env.RCT_METRO_PORT || 8081)
};

module.exports = config;
