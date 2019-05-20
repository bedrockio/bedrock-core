import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import { Provider } from 'mobx-react';
import { Router } from 'react-router-dom';
import createHistory from 'history/createBrowserHistory';
import { syncHistoryWithStore, RouterStore } from 'mobx-react-router';
import { configure } from 'mobx';
import { ThemeProvider } from 'styled-components';

import stores from './stores';
import config from './config';

import generatedTheme from './theme/theme.generated.json';

configure({
  enforceActions: 'always'
});

if (config.SENTRY_DSN && window.Sentry) {
  window.Sentry.init({ dsn: config.SENTRY_DSN });
}

const routing = new RouterStore();
const history = syncHistoryWithStore(createHistory(), routing);

const Wrapper = () => (
  <Provider routing={routing} {...stores}>
    <ThemeProvider theme={generatedTheme}>
      <Router history={history}>
        <App />
      </Router>
    </ThemeProvider>
  </Provider>
);

ReactDOM.render(<Wrapper />, document.getElementById('root'));
