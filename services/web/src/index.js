// react-hot-loader needs to be imported
// before react and react-dom
import 'react-hot-loader';

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SessionProvider } from 'stores';

import 'utils/sentry';

// Layouts

import { useLayout } from 'helpers/screen';
import DashboardLayout from 'layouts/Dashboard';
import PortalLayout from 'layouts/Portal';

useLayout(DashboardLayout, 'Dashboard');
useLayout(PortalLayout, 'Portal');

// Icons

import { Icon } from 'semantic';
import basicIcons from 'semantic/assets/icons/basic.svg';
import outlineIcons from 'semantic/assets/icons/outline.svg';

Icon.useSet(basicIcons);
Icon.useSet(outlineIcons, 'outline');

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
