// Real bcrypt at the production cost of 12 takes ~200ms per hash or compare,
// which dominates the auth tests. Passwords are stored as `salt:<password>` here.

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
