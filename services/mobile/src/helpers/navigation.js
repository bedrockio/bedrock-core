import {
  createStackNavigator as baseCreateStackNavigator,
  NavigationActions,
  StackActions
} from 'react-navigation';

import { constants, styles } from 'app';

import { Native } from 'app';

let navigator;

export const setNavigator = (ref) => (navigator = ref);

export const createStackNavigator = (screens) =>
  baseCreateStackNavigator(screens, {
    cardStyle: styles.card,
    navigationOptions: {
      headerStyle: styles.header,
      headerTitleStyle: styles.headerTitle,
      headerBackTitleStyle: styles.headerTitle,
      headerTintColor: constants.colors.white
    }
  });

export const goToScreen = (routeName, params) =>
  navigator.dispatch(
    NavigationActions.navigate({
      routeName,
      params
    })
  );

export const pushScreen = (routeName, params) =>
  navigator.dispatch(
    StackActions.push({
      routeName,
      params
    })
  );

export const goBack = () => navigator.dispatch(NavigationActions.back());

export const goToScreenCallback = (routeName, params) => () =>
  goToScreen(routeName, params);

export const pushScreenCallback = (routeName, params) => () =>
  pushScreen(routeName, params);

export const goBackCallback = () => () => goBack();

export const linkTo = (url) => () => Native.Linking.openURL(url);
