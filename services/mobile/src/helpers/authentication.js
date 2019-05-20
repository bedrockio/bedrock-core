import { Native, Expo, Api, helpers } from 'app';

export const logIn = async ({ onLogIn, onLoadTasks, onLoadEnrollments }) => {
  let mobilePushToken;

  if (await helpers.requestNotificationsPermissions())
    mobilePushToken = await Expo.Notifications.getExpoPushTokenAsync();

  const deviceInfo = helpers.pick(Expo.Constants, [
    'deviceId',
    'deviceName',
    'deviceYearClass',
    'expoRuntimeVersion',
    'expoVersion',
    'installationId',
    'manifest.sdkVersion',
    'manifest.version',
    'manifest.ios.buildNumber',
    'manifest.android.versionCode',
    'platform',
    'sessionId'
  ]);

  const [user, tasks, enrollments] = await Promise.all([
    Api.updateSelf({
      mobilePushToken,
      deviceInfo
    })
  ]);

  onLogIn(user);
};

export const logOut = async ({ onLogOut }) => {
  await Native.AsyncStorage.removeItem('authenticationToken');

  onLogOut();
};

export const authenticationToken = () =>
  Native.AsyncStorage.getItem('authenticationToken');

export const setAuthenticationToken = (token) =>
  Native.AsyncStorage.setItem('authenticationToken', token);
