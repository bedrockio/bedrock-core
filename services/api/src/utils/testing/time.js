const { createClock, timers } = require('@sinonjs/fake-timers');

let clock;

function mockTime() {
  clock = createClock();
  global.Date = clock.Date;
}

function unmockTime() {
  global.Date = timers.Date;
}

function setTime(time) {
  clock.setSystemTime(time);
}

function advanceTime(ms) {
  clock.setSystemTime(Date.now() + ms);
}

module.exports = {
  setTime,
  mockTime,
  unmockTime,
  advanceTime,
};
