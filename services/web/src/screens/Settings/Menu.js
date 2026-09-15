import { Bell, LockOpen, User } from 'lucide-react';

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
          icon: <User />,
          href: `/settings/details`,
        },
        {
          title: 'Security',
          icon: <LockOpen />,
          href: '/settings/security',
        },
        {
          title: 'Notifications',
          icon: <Bell />,
          href: '/settings/notifications',
        },
      ]}
    />
  );
}
