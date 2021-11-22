const { customAlphabet } = require('nanoid');

function generateCode(length, alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
  return customAlphabet(alphabet, length);
}

module.exports = {
  generateCode,
};
