import '@mantine/core/styles.css';

import React, { StrictMode, Suspense } from 'react';

import { MantineProvider } from '@mantine/core';
import { BrowserRouter, Routes, Route } from '@bedrockio/router';
import { HelmetProvider } from 'react-helmet-async';

import { theme } from './theme';

import { SessionProvider, useSession } from 'stores/session';
import { ThemeProvider } from 'stores/theme';

import SessionSwitch from 'helpers/SessionSwitch';
import 'utils/sentry';

//import solidIcons from 'semantic/assets/icons/solid.svg';
//import brandIcons from 'semantic/assets/icons/brands.svg';
//import regularIcons from 'semantic/assets/icons/regular.svg';

// this is to handle some issue rich editor
window.global = window;

//Icon.useSet(solidIcons);
//Icon.useSet(brandIcons, 'brands');
//Icon.useSet(regularIcons, 'regular');

import LoadingScreen from 'screens/Loading';

import { hasAccess } from 'utils/user';

const App = React.lazy(() => import('./App.js'));
const AuthApp = React.lazy(() => import('./AuthApp.js'));
const DocsApp = React.lazy(() => import('./Docs.js'));
const OnboardApp = React.lazy(() => import('./OnboardApp.js'));

function AppSwitch() {
  const { user } = useSession();
  if (hasAccess(user)) {
    return <App />;
  } else {
    return <AuthApp />;
  }
}

export default function Wrapper() {
  return (
    <StrictMode>
      <MantineProvider theme={theme}>
        <BrowserRouter>
          <ThemeProvider>
            <HelmetProvider>
              <SessionProvider>
                <SessionSwitch>
                  <Suspense fallback={<LoadingScreen />}>
                    <Routes>
                      <Route path="/onboard" render={OnboardApp} />
                      <Route path="/docs" render={DocsApp} />
                      <Route path="/" render={AppSwitch} />
                    </Routes>
                  </Suspense>
                </SessionSwitch>
              </SessionProvider>
            </HelmetProvider>
          </ThemeProvider>
        </BrowserRouter>
      </MantineProvider>
    </StrictMode>
  );
}
