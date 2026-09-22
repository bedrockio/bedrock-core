import SettingsShell from 'components/SettingsShell';

const SECTIONS = [
  { label: 'Details', url: '/settings/details' },
  { label: 'Security', url: '/settings/security' },
  { label: 'Notifications', url: '/settings/notifications' },
];

export default function SettingsLayout({ children }) {
  return (
    <SettingsShell
      title="Settings"
      rootHref="/settings/details"
      sections={SECTIONS}>
      {children}
    </SettingsShell>
  );
}
