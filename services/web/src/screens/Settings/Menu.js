import { IoMdNotifications } from 'react-icons/io';
import { PiLockKeyOpenBold, PiUserBold } from 'react-icons/pi';

import PageHeader from 'components/PageHeader';

export default function SettingsMenu() {
  const items = [
    {
      title: 'Home',
      href: '/',
    },
    { title: 'Settings' },
  ];

  return (
    <PageHeader
      title="Settings"
      breadcrumbItems={items}
      tabs={[
        {
          title: 'Details',
          icon: <PiUserBold />,
          href: `/settings/details`,
        },
        {
          title: 'Security',
          icon: <PiLockKeyOpenBold />,
          href: '/settings/security',
        },
        {
          title: 'Notifications',
          icon: <IoMdNotifications />,
          href: '/settings/notifications',
        },
      ]}
    />
  );
}
