// part of integration with mantine
import { BrowserRouter, Route, Routes } from '@bedrockio/router';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import React, { Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';

import SessionSwitch from 'helpers/SessionSwitch';
import { SessionProvider, useSession } from 'stores/session';

import LoadingScreen from 'screens/Loading';

import 'utils/sentry';
import { hasAccess } from 'utils/user';

import { theme } from './theme';

dayjs.extend(customParseFormat);

const App = React.lazy(() => import('./App.js'));
const AuthApp = React.lazy(() => import('./AuthApp.js'));
const DocsApp = React.lazy(() => import('./DocsApp.js'));
const OnboardApp = React.lazy(() => import('./OnboardApp.js'));

function AppSwitch() {
  const { user, ready } = useSession();
  if (hasAccess(user) && ready) {
    return <App />;
  } else {
    return <AuthApp />;
  }
}

export default function Wrapper() {
  return (
    <SessionProvider>
      <MantineProvider theme={theme}>
        <Notifications />

        <BrowserRouter>
          <HelmetProvider>
            <SessionSwitch>
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  <Route path="/onboard" render={OnboardApp} />
                  <Route path="/docs" render={DocsApp} />
                  <Route path="/" render={AppSwitch} />
                </Routes>
              </Suspense>
            </SessionSwitch>
          </HelmetProvider>
        </BrowserRouter>
      </MantineProvider>
    </SessionProvider>
  );
}
