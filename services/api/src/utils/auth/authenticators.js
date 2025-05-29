function getAuthenticator(user, type) {
  return user.authenticators.find((authenticator) => {
    return authenticator.type === type;
  });
}

function getAuthenticators(user, type) {
  return user.authenticators.filter((authenticator) => {
    return authenticator.type === type;
  });
}

function hasAuthenticator(user, type) {
  return !!getAuthenticator(user, type);
}

function addAuthenticator(user, attributes) {
  user.authenticators.push({
    createdAt: new Date(),
    lastUsedAt: new Date(),
    ...attributes,
  });
}

function assertAuthenticator(user, type) {
  const authenticator = getAuthenticator(user, type);
  if (!authenticator) {
    throw new Error(`No ${type} set.`);
  }
  return authenticator;
}

// Create

function upsertAuthenticator(user, attributes) {
  const { type } = attributes;
  let authenticator = getAuthenticator(user, type);
  if (authenticator) {
    authenticator.lastUsedAt = new Date();
  } else {
    addAuthenticator(user, attributes);
  }
}

// Delete

function removeAuthenticator(user, id) {
  user.authenticators = user.authenticators.filter((authenticator) => {
    return authenticator.id !== id;
  });
}

function clearAuthenticators(user, type) {
  user.authenticators = user.authenticators.filter((authenticator) => {
    return authenticator.type !== type;
  });
}

module.exports = {
  addAuthenticator,
  getAuthenticator,
  hasAuthenticator,
  getAuthenticators,
  clearAuthenticators,
  removeAuthenticator,
  assertAuthenticator,
  upsertAuthenticator,
};
