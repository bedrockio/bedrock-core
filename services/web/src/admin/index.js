import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import { Provider } from 'mobx-react';
import { HelmetProvider } from 'react-helmet-async';
import { Router } from 'react-router-dom';
import createHistory from 'history/createBrowserHistory';
import { syncHistoryWithStore, RouterStore } from 'mobx-react-router';
import { configure } from 'mobx';
import { ThemeProvider } from 'styled-components';

import stores from 'common/stores';
import generatedTheme from 'common/theme/theme.generated.json';

configure({
  enforceActions: 'always'
});

const routing = new RouterStore();
const history = syncHistoryWithStore(createHistory(), routing);

const Wrapper = () => (
  <Provider routing={routing} {...stores}>
    <ThemeProvider theme={generatedTheme}>
      <HelmetProvider>
        <Router history={history}>
          <App />
        </Router>
      </HelmetProvider>
    </ThemeProvider>
  </Provider>
);

ReactDOM.render(<Wrapper />, document.getElementById('root'));
