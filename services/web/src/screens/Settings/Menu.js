import {
  IconFingerprintScan,
  IconList,
  IconMessage,
  IconNotification,
  IconPaint,
  IconPassword,
  IconUser,
} from '@tabler/icons-react';
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
          title: 'Profile',
          icon: <IconUser size={14} />,
          href: `/settings/profile`,
        },
        {
          title: 'Notifications',
          icon: <IconMessage size={14} />,
          href: '/settings/notifications',
        },
        {
          title: 'Appearance',
          icon: <IconPaint size={14} />,
          href: '/settings/appearance',
        },
        {
          title: 'Security',
          icon: <IconFingerprintScan size={14} />,
          href: '/settings/security',
        },
        {
          title: 'Sessions',
          icon: <IconList size={14} />,
          href: '/settings/sessions',
        },
      ]}
    />
  );
}
