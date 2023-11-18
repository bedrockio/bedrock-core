export function getUrlToken(param = 'token') {
  const token = new URLSearchParams(location.search).get(param);
  const payload = parseToken(token);
  return {
    token,
    payload,
  };
}

export function parseToken(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (err) {
    return null;
  }
}
