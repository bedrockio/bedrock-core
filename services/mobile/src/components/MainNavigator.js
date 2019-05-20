import { createSwitchNavigator } from 'react-navigation';

import { Screens } from 'app';

import AuthenticationNavigator from './AuthenticationNavigator';
import NotificationManager from './NotificationManager';

export default createSwitchNavigator({
  Loading: Screens.Loading,
  Authentication: AuthenticationNavigator,
  Application: NotificationManager
});
