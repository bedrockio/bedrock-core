const { parseDate } = require('./date');

function validateString(str) {
  if (!str) {
    return 'Cannot be empty.';
  } else if (str.match(/['"]/)) {
    return 'Exclude quotes.';
  }
  return true;
}

function validateCamelUpper(str) {
  if (!str) {
    return 'Please enter a valid name.';
  } else if (!str.match(/^[A-Z][a-z][A-Za-z]*$/)) {
    return 'Please enter name in upper camel case.';
  }
  return true;
}

function validateNumber(str) {
  if (!str) {
    return 'Value required.';
  } else if (Number.isNaN(+str)) {
    return 'Number is not valid.';
  }
  return true;
}

function validateRegExp(str) {
  if (!str.match(/^\/.+\/$/)) {
    return 'Please enter a valid RegExp.';
  }
  return true;
}

function validateBoolean(str) {
  if (str !== 'true' && str !== 'false') {
    return 'Please enter true or false';
  }
  return true;
}

function validateDate(str) {
  if (str === 'now') {
    return true;
  }
  const date = parseDate(str);
  if (Number.isNaN(date.getTime())) {
    return 'Enter any intelligible date or "now".';
  }
  return true;
}

module.exports = {
  validateDate,
  validateString,
  validateNumber,
  validateRegExp,
  validateBoolean,
  validateCamelUpper,
};
