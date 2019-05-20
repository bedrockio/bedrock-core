import React from 'react';
import { connect as connectToRedux } from 'react-redux';

import { Expo } from 'app';

import ApplicationNavigator from './ApplicationNavigator';

class NotificationManager extends React.Component {
  static router = ApplicationNavigator.router;

  componentDidMount = () =>
    (this.listener = Expo.Notifications.addListener(this.onNotify));

  onNotify = async ({ data }) => {
    if (this.props.user.id === data.recipientUserId) {
      // sync data for user
    }
  };

  componentWillUnmount = () => this.listener.remove();

  render = () => <ApplicationNavigator navigation={this.props.navigation} />;
}

export default connectToRedux(({ user }) => ({ user }), (dispatch) => ({}))(
  NotificationManager
);
