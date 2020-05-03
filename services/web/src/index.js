// react-hot-loader needs to be imported
// before react and react-dom
import 'react-hot-loader';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import { Provider } from 'mobx-react';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { syncHistoryWithStore, RouterStore } from 'mobx-react-router';
import { configure } from 'mobx';
import { ThemeProvider } from 'styled-components';
import { SENTRY_DSN } from 'utils/env';

import stores from './stores';

import generatedTheme from './theme/theme.generated.json';

configure({
  enforceActions: 'always'
});

if (SENTRY_DSN && window.Sentry) {
  window.Sentry.init({ dsn: SENTRY_DSN });
}

const routing = new RouterStore();
const history = syncHistoryWithStore(createBrowserHistory(), routing);

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
