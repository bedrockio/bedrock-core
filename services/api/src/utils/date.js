const config = require('@bedrockio/config');
const { DateTime } = require('@bedrockio/chrono');

const DEFAULT_TIME_ZONE = config.get('DEFAULT_TIME_ZONE');

function getDateTime(arg, user) {
  const { timeZone = DEFAULT_TIME_ZONE } = user || {};
  if (arg instanceof DateTime) {
    return arg.setZone(timeZone);
  } else if (arg != null) {
    return new DateTime(arg, {
      timeZone,
    });
  } else {
    return new DateTime({
      timeZone,
    });
  }
}

function getTimeZone(user) {
  return user.timeZone || DEFAULT_TIME_ZONE;
}

module.exports = {
  getDateTime,
  getTimeZone,
};
