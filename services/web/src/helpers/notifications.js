import { showNotification } from '@mantine/notifications';
import { PiCheckBold } from 'react-icons/pi';

export function showSuccessNotification(params) {
  showNotification({
    ...params,
    color: 'green',
    icon: <PiCheckBold />,
  });
}
