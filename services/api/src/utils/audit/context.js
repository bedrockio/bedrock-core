const { AsyncLocalStorage } = require('async_hooks');

const context = new AsyncLocalStorage();

module.exports = context;
