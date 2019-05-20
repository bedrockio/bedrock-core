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

class SignUp extends React.Component {
  static navigationOptions = {
    title: 'Sign up'
  };

  render = () => (
    <Components.ScrollableForm
      validations={this.validations}
      onSubmit={this.onSubmit}
      destination="Application"
    >
      <Native.Text
        style={[
          styles.titleText,
          { marginBottom: constants.spacing.base * 2, textAlign: 'center' }
        ]}
      >
        Create your account
      </Native.Text>
      <Components.EmailInput
        name="email"
        placeholder="Email"
        returnKeyType="next"
        autoFocus
      />
      <Components.PasswordInput name="password" returnKeyType="done" />
      <Components.PasswordInput
        name="passwordConfirmation"
        placeholder="Confirm password"
        returnKeyType="done"
      />
      <Components.SubmitButton title="Sign up" />
    </Components.ScrollableForm>
  );

  validations = {
    email: helpers.validatesEmail,
    password: helpers.validatesRequiredString,
    passwordConfirmation: helpers.validatesRequiredString.oneOf([
      helpers.validations.ref('password')
    ])
  };

  onSubmit = async ({ email, password }) => {
    await Api.createUser({
      email,
      password
    });

    await helpers.logIn(this.props);
  };
}

export default connectToRedux(null, (dispatch) => ({
  onLogIn: (user) => dispatch(actions.logIn(user))
}))(SignUp);
