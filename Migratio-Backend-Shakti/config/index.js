const env = process.env.NODE_ENV || 'default';
let config;

try {
  config = require(`./${env}.js`);
} catch (e) {
  config = require('./default.js');
}

module.exports = config; 