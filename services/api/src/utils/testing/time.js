const MockDate = require('mockdate');

function mockTime() {
  MockDate.set(Date.now());
}

function unmockTime() {
  MockDate.reset();
}

function setTime(time) {
  MockDate.set(time);
}

function advanceTime(ms) {
  MockDate.set(Date.now() + ms);
}

module.exports = {
  setTime,
  mockTime,
  unmockTime,
  advanceTime,
};
