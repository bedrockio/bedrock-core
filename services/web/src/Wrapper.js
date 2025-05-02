import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';

// part of integration with mantine
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

import React, { Suspense } from 'react';

import { MantineProvider } from '@mantine/core';
import { BrowserRouter, Routes, Route } from '@bedrockio/router';
import { HelmetProvider } from 'react-helmet-async';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';

import { theme } from './theme';

import { SessionProvider, useSession } from 'stores/session';

import SessionSwitch from 'helpers/SessionSwitch';
import 'utils/sentry';

import LoadingScreen from 'screens/Loading';

import { hasAccess } from 'utils/user';

const App = React.lazy(() => import('./App.js'));
const AuthApp = React.lazy(() => import('./AuthApp.js'));
const DocsApp = React.lazy(() => import('./Docs.js'));
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
        <ModalsProvider>
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
        </ModalsProvider>
      </MantineProvider>
    </SessionProvider>
  );
}
