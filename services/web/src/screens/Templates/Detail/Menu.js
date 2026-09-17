import { Link } from '@bedrockio/router';

import { usePage } from 'stores/page';

import CloseButton from 'components/CloseButton';
import PageHeader from 'components/PageHeader';
import Protected from 'components/Protected';

import { Button } from '@/components/ui/button';

import Actions from '../Actions';

export default function TemplateMenu({ displayMode }) {
  const { template, reload } = usePage();
  const isEditing = displayMode === 'edit';

  const items = [
    { title: 'Home', href: '/' },
    { title: 'Templates', href: '/templates' },
    { title: template.name },
  ];

  const tabs = [
    { title: 'Overview', href: `/templates/${template.id}` },
    { title: 'Content', href: `/templates/${template.id}/content` },
  ];
  if (template.channels.includes('email')) {
    tabs.push({ title: 'Preview', href: `/templates/${template.id}/preview` });
  }

  return (
    <PageHeader
      tabs={isEditing ? undefined : tabs}
      title={template.name}
      breadcrumbItems={items}
      rightSection={
        isEditing ? (
          <CloseButton to={`/templates/${template.id}`} />
        ) : (
          <>
            <Protected endpoint="templates" permission="update">
              <Button variant="outline" asChild>
                <Link to={`/templates/${template.id}/edit`}>Edit</Link>
              </Button>
            </Protected>
            <Actions
              displayMode={displayMode}
              template={template}
              reload={reload}
            />
          </>
        )
      }
    />
  );
}
