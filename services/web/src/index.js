// react-hot-loader needs to be imported
// before react and react-dom
import 'react-hot-loader';

import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
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

// eslint-disable-next-line
ReactDOM.render(<Wrapper />, document.getElementById('root'));
