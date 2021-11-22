const { customAlphabet } = require('nanoid');
const { memoize } = require('lodash');

// only uppercase + no 0/O
const humanSafeAlphabet = '123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const nanoid = memoize((length) => customAlphabet(humanSafeAlphabet, length));

function generateHumanCode(length) {
  return nanoid(length)();
}

module.exports = {
  generateHumanCode,
};
