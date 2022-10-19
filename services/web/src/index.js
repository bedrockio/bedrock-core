import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SessionProvider } from 'stores';
import 'utils/sentry';

// Icons

import { Icon } from 'semantic';
import solidIcons from 'semantic/assets/icons/solid.svg';
import brandIcons from 'semantic/assets/icons/brands.svg';
import regularIcons from 'semantic/assets/icons/regular.svg';

Icon.useSet(solidIcons);
Icon.useSet(brandIcons, 'brand');
Icon.useSet(regularIcons, 'regular');

// Scrolling
import ScrollProvider from 'helpers/ScrollProvider';

import App from './App';

const root = createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
    <SessionProvider>
      <HelmetProvider>
        <ScrollProvider>
          <App />
        </ScrollProvider>
      </HelmetProvider>
    </SessionProvider>
  </BrowserRouter>
);
