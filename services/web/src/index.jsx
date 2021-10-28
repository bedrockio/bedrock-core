import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SessionProvider } from 'stores';

//import 'utils/sentry';

// Icons

import { Icon } from 'semantic';
import solidIcons from 'semantic/assets/icons/solid.svg';
import brandIcons from 'semantic/assets/icons/brands.svg';
import regularIcons from 'semantic/assets/icons/regular.svg';

Icon.useSet(solidIcons);
Icon.useSet(brandIcons, 'brand');
Icon.useSet(regularIcons, 'regular');

import App from './App';

const Wrapper = () => (
  <BrowserRouter>
    <HelmetProvider>
      <SessionProvider>
        <App />
      </SessionProvider>
    </HelmetProvider>
  </BrowserRouter>
);

ReactDOM.render(
  <React.StrictMode>
    <Wrapper />
  </React.StrictMode>,
  document.getElementById('root')
);
