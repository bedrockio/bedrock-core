import { IconFingerprintScan, IconUser } from '@tabler/icons-react';
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
          icon: <IconUser size={14} />,
          href: `/settings/details`,
        },
        {
          title: 'Security',
          icon: <IconFingerprintScan size={14} />,
          href: '/settings/security',
        },
      ]}
    />
  );
}
