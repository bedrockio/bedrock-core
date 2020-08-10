function timeStr() {
  return new Date().toString();
}

const logger = {
  debug(...args) {
    console.info(...[timeStr(), '-', 'DEBUG', '-'].concat(args));
  },
  info(...args) {
    console.info(...[timeStr(), '-', 'INFO', '-'].concat(args));
  },
  warn(...args) {
    console.info(...[timeStr(), '-', 'WARN', '-'].concat(args));
  },
  error(...args) {
    console.info(...[timeStr(), '-', 'ERROR', '-'].concat(args));
  }
};

export { logger };
