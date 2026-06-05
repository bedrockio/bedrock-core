import { BrowserRouter, Route, Routes } from '@bedrockio/router';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import React, { Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';

import SessionSwitch from 'helpers/SessionSwitch';
import { SessionProvider, useSession } from 'stores/session';

import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';

import LoadingScreen from 'screens/Loading';
import Unsubscribe from 'screens/Unsubscribe';

import 'utils/sentry';
import { hasAccess } from 'utils/user';

import './styles/globals.css';

dayjs.extend(customParseFormat);

const App = React.lazy(() => import('./App.js'));
const AuthApp = React.lazy(() => import('./AuthApp.js'));
const DocsApp = React.lazy(() => import('./DocsApp.js'));
const OnboardApp = React.lazy(() => import('./OnboardApp.js'));

function AppSwitch() {
  const { user, loading } = useSession();
  if (loading) {
    return <LoadingScreen />;
  } else if (hasAccess(user)) {
    return <App />;
  } else {
    return <AuthApp />;
  }
}

export default function Wrapper() {
  return (
    <SessionProvider>
      <ThemeProvider>
        <Toaster />
        <BrowserRouter>
          <HelmetProvider>
            <SessionSwitch>
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  <Route path="/onboard" render={OnboardApp} />
                  <Route path="/unsubscribe" render={Unsubscribe} exact />
                  <Route path="/docs" render={DocsApp} />
                  <Route path="/" render={AppSwitch} />
                </Routes>
              </Suspense>
            </SessionSwitch>
          </HelmetProvider>
        </BrowserRouter>
      </ThemeProvider>
    </SessionProvider>
  );
}
