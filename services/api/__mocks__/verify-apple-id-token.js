async function verifyToken(options) {
  const { idToken } = options;
  try {
    return JSON.parse(idToken);
  } catch {
    throw new Error('Bad Token');
  }
}

function createToken(payload) {
  payload.email_verified ??= true;
  return JSON.stringify(payload);
}

module.exports = {
  createToken,
  default: verifyToken,
};
