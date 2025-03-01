import React, { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';

import { BrowserRouter, Routes, Route } from '@bedrockio/router';
import { HelmetProvider } from 'react-helmet-async';

// Icons
import { Icon } from 'semantic';

import { SessionProvider, useSession } from 'stores/session';
import { ThemeProvider } from 'stores/theme';

import SessionSwitch from 'helpers/SessionSwitch';
import 'utils/sentry';

import solidIcons from 'semantic/assets/icons/solid.svg';
import brandIcons from 'semantic/assets/icons/brands.svg';
import regularIcons from 'semantic/assets/icons/regular.svg';

// this is to handle some issue rich editor
window.global = window;

Icon.useSet(solidIcons);
Icon.useSet(brandIcons, 'brands');
Icon.useSet(regularIcons, 'regular');

import LoadingScreen from 'screens/Loading';

import { hasAccess } from 'utils/user';

const App = React.lazy(() => import('./App'));
const AuthApp = React.lazy(() => import('./AuthApp'));
const DocsApp = React.lazy(() => import('./docs/App'));
const OnboardApp = React.lazy(() => import('./OnboardApp'));

function AppSwitch() {
  const { user } = useSession();
  if (hasAccess(user)) {
    return <App />;
  } else {
    return <AuthApp />;
  }
}

const Wrapper = () => (
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
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Wrapper />
  </StrictMode>
);
