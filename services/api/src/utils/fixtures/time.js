const REL_TIME_REG = /([+-]?\d+)([ywdhs]|m(?:in)?)/g;

const TIME_UNITS = {
  y(date, val) {
    date.setFullYear(date.getFullYear() + val);
  },

  m(date, val) {
    date.setMonth(date.getMonth() + val);
  },

  w(date, val) {
    date.setDate(date.getDate() + val * 7);
  },

  d(date, val) {
    date.setDate(date.getDate() + val);
  },

  h(date, val) {
    date.setHours(date.getHours() + val);
  },

  min(date, val) {
    date.setMinutes(date.getMinutes() + val);
  },

  s(date, val) {
    date.setSeconds(date.getSeconds() + val);
  },
};

function convertRelativeTime(str) {
  let date;
  let dir = 1;
  let last;
  for (let match of str.matchAll(REL_TIME_REG)) {
    if (!date) {
      date = new Date();
    }
    const val = parseInt(match[1]);
    let unit = match[2];
    if (unit === 'm' && last === 'h') {
      unit = 'min';
    }
    const fn = TIME_UNITS[unit];
    fn(date, val * dir);
    dir = val < 0 ? -1 : 1;
    last = unit;
  }

  return date;
}

module.exports = {
  convertRelativeTime,
};
