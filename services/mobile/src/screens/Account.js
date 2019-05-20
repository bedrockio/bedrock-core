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

class Account extends React.Component {
  static navigationOptions = {
    title: 'My account'
  };

  render = () => (
    <Native.View style={styles.stretch}>
      <Native.View style={[styles.stretch, { padding: 0 }]}>
        <Components.TextButton
          title="Privacy policy"
          url={constants.urls.privacyPolicy}
        />
      </Native.View>
      <Native.View>
        <Native.Text style={[styles.interfaceText, { textAlign: 'center' }]}>
          Logged in as {this.props.user.email}
        </Native.Text>
        <Components.Form onSubmit={this.onLogOut} destination="Authentication">
          <Components.SubmitButton title="Log out" />
        </Components.Form>
      </Native.View>
    </Native.View>
  );

  onLogOut = async () => {
    await Api.updateSelf({
      mobilePushToken: null
    });

    helpers.logOut(this.props);
  };
}

export default connectToRedux(
  ({ user }) => ({ user }),
  (dispatch) => ({
    onLogOut: () => dispatch(actions.logOut())
  })
)(Account);
