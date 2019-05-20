import React from 'react';
import { Provider } from 'react-redux';

import store from 'store';

import { Components, helpers } from 'app';

export default () => (
  <Provider store={store}>
    <Components.ErrorManager>
      <Components.MainNavigator ref={helpers.setNavigator} />
    </Components.ErrorManager>
  </Provider>
);
