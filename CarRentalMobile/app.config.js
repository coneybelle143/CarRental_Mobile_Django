/* global __dirname */
const fs = require('fs');
const path = require('path');
const appJson = require('./app.json');

const envPath = path.resolve(__dirname, '.env');

function parseDotEnv(source) {
  return source.split(/\r?\n/).reduce((acc, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return acc;
    const [key, ...rest] = trimmed.split('=');
    acc[key.trim()] = rest.join('=').trim();
    return acc;
  }, {});
}

const env = fs.existsSync(envPath)
  ? parseDotEnv(fs.readFileSync(envPath, 'utf8'))
  : {};

const apiUrl = process.env.EXPO_PUBLIC_API_URL || env.EXPO_PUBLIC_API_URL;

module.exports = {
  ...appJson,
  expo: {
    ...appJson.expo,
    extra: {
      ...(appJson.expo?.extra || {}),
      apiUrl,
    },
  },
};
