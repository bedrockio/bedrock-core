import { Constants } from 'expo';

import { isStaging, isProduction } from 'helpers';

// Common.
const common = {
  urls: {
    help: 'http://support.platform.com/',
    privacyPolicy: 'http://platform.com/privacy-policy'
  },
  spacing: {
    small: 5,
    base: 10,
    large: 15
  },
  colors: {
    indigo: '#000078',
    indigoHighlight: '#2e1f9c',
    green: '#00ffb0',
    gray: '#ccc',
    darkGray: '#aaa',
    white: 'white',
    text: '#5f6576',
    background: '#e6e6e6',
    transparent: '#0000'
  }
};

// Current environment.
let environment;

if (isProduction) {
  environment = {
    apiBaseUrl: 'https://api.platform.com'
  };
} else if (isStaging) {
  environment = {
    apiBaseUrl: 'http://api-staging.platform.com'
  };
} else {
  environment = {
    apiBaseUrl: `http://${
      Constants.manifest.hostUri.match(/^([^:]+):[0-9]+$/)[1]
    }:2300`
  };
}

// Export.
export default {
  ...common,
  ...environment
};
