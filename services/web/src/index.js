// react-hot-loader needs to be imported
// before react and react-dom
import 'react-hot-loader';

import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Icons
import { Icon } from 'semantic';

import { SessionProvider, ThemeProvider } from 'stores';
import SessionSwitch from 'helpers/SessionSwitch';
import 'utils/sentry';

import solidIcons from 'semantic/assets/icons/solid.svg';
import brandIcons from 'semantic/assets/icons/brands.svg';
import regularIcons from 'semantic/assets/icons/regular.svg';

Icon.useSet(solidIcons);
Icon.useSet(brandIcons, 'brands');
Icon.useSet(regularIcons, 'regular');

import LoadingScreen from 'screens/Loading';

// Scrolling
import ScrollProvider from 'helpers/ScrollProvider';

const Wrapper = () => (
  <BrowserRouter>
    <ThemeProvider>
      <HelmetProvider>
        <ScrollProvider>
          <SessionProvider>
            <SessionSwitch>
              <Suspense fallback={<LoadingScreen />}>
                <Switch>
                  <Route
                    path="/docs"
                    component={React.lazy(() => import('./docs/App'))}
                  />
                  <Route
                    path="/"
                    component={React.lazy(() => import('./App'))}
                  />
                </Switch>
              </Suspense>
            </SessionSwitch>
          </SessionProvider>
        </ScrollProvider>
      </HelmetProvider>
    </ThemeProvider>
  </BrowserRouter>
);

ReactDOM.render(<Wrapper />, document.getElementById('root'));
