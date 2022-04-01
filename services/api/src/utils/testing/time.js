const { createClock, timers } = require('@sinonjs/fake-timers');

let clock;

function mockTime(time) {
  if (!time) {
    throw new Error('Time mocks require a starting date.');
  }
  clock = createClock();
  global.Date = clock.Date;
  setTime(time);
}

function unmockTime() {
  global.Date = timers.Date;
}

function setTime(time) {
  if (typeof time === 'string') {
    time = new Date(time);
  }
  if (time instanceof Date) {
    time = time.getTime();
  }
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
