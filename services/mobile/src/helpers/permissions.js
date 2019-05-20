import { Native, Expo } from 'app';

export const requestPermissions = async (type, messageTitle, messageBody) => {
  const storageKey = `isPermissionsDenied.${type}`;
  const { status } = await Expo.Permissions.askAsync(Expo.Permissions[type]);

  if (!isGranted(status) && !(await Native.AsyncStorage.getItem(storageKey))) {
    Native.Alert.alert(messageTitle, messageBody);
    Native.AsyncStorage.setItem(storageKey, 'true');
  }

  return isGranted(status);
};

export const requestNotificationsPermissions = async () =>
  await requestPermissions(
    'NOTIFICATIONS',
    'You have disabled push notifications',
    'Without notifications enabled you won’t be able to receive task reminders. To enable notifications, open the Settings app and set notifications for the Litmus app to ‘Allow Notifications’.'
  );

const isGranted = (status) => status === 'granted';
