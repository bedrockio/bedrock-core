// react-hot-loader needs to be imported
// before react and react-dom
import 'react-hot-loader';

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Icons
import { Icon } from 'semantic';

import { SessionProvider, ThemeProvider } from 'stores';
import 'utils/sentry';

import solidIcons from 'semantic/assets/icons/solid.svg';
import brandIcons from 'semantic/assets/icons/brands.svg';
import regularIcons from 'semantic/assets/icons/regular.svg';

Icon.useSet(solidIcons);
Icon.useSet(brandIcons, 'brands');
Icon.useSet(regularIcons, 'regular');

// Scrolling
import ScrollProvider from 'helpers/ScrollProvider';

import App from './App';

const Wrapper = () => (
  <BrowserRouter>
    <ThemeProvider>
      <SessionProvider>
        <HelmetProvider>
          <ScrollProvider>
            <App />
          </ScrollProvider>
        </HelmetProvider>
      </SessionProvider>
    </ThemeProvider>
  </BrowserRouter>
);

ReactDOM.createRoot(<Wrapper />, document.getElementById('root'));
