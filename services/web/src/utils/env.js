// Vite seems to have bug allowing custom prefixes
// so stripping it off here.
function getStrippedEnv() {
  const env = {};
  for (let [key, val] of Object.entries(window.__ENV__ || import.meta.env)) {
    env[key.replace('VITE_', '')] = val;
  }
  return env;
}

const {
  API_URL,
  APP_NAME,
  APP_URL,
  APP_SUPPORT_EMAIL,
  SENTRY_DSN,
  ENV_NAME,
  GOOGLE_API_KEY,
  API_KEY,
} = getStrippedEnv();

export {
  API_URL,
  APP_NAME,
  APP_URL,
  APP_SUPPORT_EMAIL,
  SENTRY_DSN,
  ENV_NAME,
  GOOGLE_API_KEY,
  API_KEY,
};
