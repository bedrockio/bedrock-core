const { create: createDate, reset: resetDate } = require('sugar-date').Date;

function parseDate(str) {
  const n = +str;
  if (!Number.isNaN(n)) {
    return new Date(n);
  } else {
    let date = createDate(str, {
      setUTC: true,
    });
    resetDate(date);
    return date;
  }
}

module.exports = {
  parseDate,
};
