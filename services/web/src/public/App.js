import { hot } from 'react-hot-loader/root';
import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { SVGIcon } from 'common/components';
import { Home } from './screens';

// Icons
import ICON_URL from 'public/assets/icons.svg';
SVGIcon.setBaseUrl(ICON_URL);

import './app.less';

class App extends React.Component {

  render() {
    return (
      <React.Fragment>
        <main>
          <Switch>
            <Route path="/" component={Home} exact />
          </Switch>
        </main>
      </React.Fragment>
    );
  }

}

export default hot(App);
