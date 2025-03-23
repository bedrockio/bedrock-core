import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';

// part of integration with mantine
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

import React, { StrictMode, Suspense } from 'react';

import { MantineProvider } from '@mantine/core';
import { BrowserRouter, Routes, Route } from '@bedrockio/router';
import { HelmetProvider } from 'react-helmet-async';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';

import { theme } from './theme';

import { SessionProvider, useSession } from 'stores/session';
import { ThemeProvider } from 'stores/theme';

import SessionSwitch from 'helpers/SessionSwitch';
import 'utils/sentry';

// this is to handle some issue with rich editor
window.global = window;

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
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <Notifications />
        <ModalsProvider>
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
        </ModalsProvider>
      </MantineProvider>
    </StrictMode>
  );
}
