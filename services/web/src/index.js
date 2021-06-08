// react-hot-loader needs to be imported
// before react and react-dom
import 'react-hot-loader';

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SessionProvider } from 'stores';

import 'layouts';
import 'utils/sentry';

import App from './App';

const Wrapper = () => (
  <BrowserRouter>
    <SessionProvider>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </SessionProvider>
  </BrowserRouter>
);

ReactDOM.render(<Wrapper />, document.getElementById('root'));
