import React from 'react';
import { connect as connectToRedux } from 'react-redux';

import {
  Native,
  Components,
  Api,
  helpers,
  actions,
  constants,
  styles
} from 'app';

import logo from 'images/logo.png';

class LogIn extends React.Component {
  static navigationOptions = {
    header: null,
    headerBackTitle: 'Log in'
  };

  render = () => (
    <Components.ScrollableForm
      validations={this.validations}
      onSubmit={this.onSubmit}
      destination="Application"
      screenHeaderPresent={false}
    >
      <Native.StatusBar barStyle="dark-content" />
      <Components.Image
        source={logo}
        style={{ width: '90%', marginBottom: constants.spacing.base * 5 }}
      />
      <Components.EmailInput
        name="email"
        placeholder="Email"
        returnKeyType="next"
        autoFocus
      />
      <Components.PasswordInput name="password" returnKeyType="done" />
      <Components.SubmitButton title="Log in" />
      <Native.View style={{ marginTop: constants.spacing.large * (5 / 6) }}>
        <Components.TextButton
          title="No account? Sign up"
          onPress={helpers.goToScreenCallback('SignUp')}
        />
      </Native.View>
    </Components.ScrollableForm>
  );

  validations = {
    email: helpers.validatesEmail,
    password: helpers.validatesRequiredString
  };

  onSubmit = async (user) => {
    await Api.createSession(user);

    await helpers.logIn(this.props);
  };
}

export default connectToRedux(null, (dispatch) => ({
  onLogIn: (user) => dispatch(actions.logIn(user))
}))(LogIn);
