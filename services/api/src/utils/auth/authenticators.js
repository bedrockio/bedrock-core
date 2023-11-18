function getAuthenticator(user, type) {
  return user.authenticators.find((authenticator) => {
    return authenticator.type === type;
  });
}

function hasAuthenticator(user, type) {
  return !!getAuthenticator(user, type);
}

function getRequiredAuthenticator(user, type) {
  const authenticator = getAuthenticator(user, type);
  if (!authenticator) {
    throw Error(`No ${type} set.`);
  }
  return authenticator;
}

// Clear existing authenticators of a given type.
function clearAuthenticators(user, type) {
  user.authenticators = user.authenticators.filter((authenticator) => {
    return authenticator.type !== type;
  });
}

module.exports = {
  getAuthenticator,
  hasAuthenticator,
  clearAuthenticators,
  getRequiredAuthenticator,
};
