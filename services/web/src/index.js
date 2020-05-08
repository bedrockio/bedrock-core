import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { createStore } from 'utils/store';

import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';

import stores from './stores';
import config from './config';

import generatedTheme from './theme/theme.generated.json';

if (config.SENTRY_DSN && window.Sentry) {
  window.Sentry.init({ dsn: config.SENTRY_DSN });
}

createStore(stores);

const Wrapper = () => (
  <ThemeProvider theme={generatedTheme}>
    <Router>
      <App />
    </Router>
  </ThemeProvider>
);

ReactDOM.render(<Wrapper />, document.getElementById('root'));
