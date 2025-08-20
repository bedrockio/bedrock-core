import { PiLockKeyOpenFill, PiUserFill } from 'react-icons/pi';
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
          icon: <PiUserFill />,
          href: `/settings/details`,
        },
        {
          title: 'Security',
          icon: <PiLockKeyOpenFill />,
          href: '/settings/security',
        },
      ]}
    />
  );
}
