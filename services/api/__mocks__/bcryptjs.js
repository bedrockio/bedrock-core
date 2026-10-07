async function genSalt() {
  return 'salt';
}

async function hash(password, salt) {
  return `${salt}:${password}`;
}

async function compare(password, hash) {
  return hash === `salt:${password}`;
}

export default { genSalt, hash, compare };
