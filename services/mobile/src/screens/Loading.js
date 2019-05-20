import React from 'react';
import { connect as connectToRedux } from 'react-redux';

import { Expo, Components, Api, helpers, actions, styles } from 'app';

import apercuBold from 'fonts/apercuBold.otf';
import portada from 'fonts/portada.otf';
import adelleSans from 'fonts/adelleSans.otf';

class Loading extends React.Component {
  componentDidMount = async () => {
    await Expo.Font.loadAsync({
      apercuBold,
      portada,
      adelleSans
    });

    await Expo.Asset.loadAsync([
      require('images/logo.png'),
      require('images/menuIcon.png')
    ]);

    if (await helpers.authenticationToken()) {
      try {
        await helpers.logIn(this.props);
        helpers.goToScreen('Application');
      } catch (error) {
        await helpers.logOut(this.props);
        this.goToAuthentication();
      }
    } else this.goToAuthentication();
  };

  goToAuthentication = () => helpers.goToScreen('Authentication');

  render = () => <Components.ActivityIndicator />;
}

export default connectToRedux(null, (dispatch) => ({
  onLogIn: (user) => dispatch(actions.logIn(user)),
  onLogOut: () => dispatch(actions.logOut())
}))(Loading);
