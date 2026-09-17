import { useSession } from 'stores/session';

import PageHeader from 'components/PageHeader';

import Form from 'screens/Organizations/Form';

export default function General() {
  const { organization } = useSession();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="General"
        breadcrumbItems={[
          { title: 'Home', href: '/' },
          { title: 'Organization Settings', href: '/organization' },
          { title: 'General' },
        ]}
      />
      {organization ? (
        <Form organization={organization} onSuccess={() => {}} />
      ) : (
        <p className="text-muted-foreground text-sm">
          No organization is currently selected.
        </p>
      )}
    </div>
  );
}
