import SettingsShell from 'components/SettingsShell';

const SECTIONS = [
  { label: 'General', url: '/organization', exact: true },
  { label: 'Templates', url: '/organization/templates' },
  { label: 'Audit Log', url: '/organization/audit-log' },
];

export default function OrganizationLayout({ children }) {
  return (
    <SettingsShell
      title="Organization Settings"
      rootHref="/organization"
      sections={SECTIONS}>
      {children}
    </SettingsShell>
  );
}
