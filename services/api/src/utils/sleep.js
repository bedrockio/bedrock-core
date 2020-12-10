function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

module.exports = {
  sleep,
};
