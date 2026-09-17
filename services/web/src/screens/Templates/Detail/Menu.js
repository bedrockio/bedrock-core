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

  const base = `/organization/templates/${template.id}`;

  const tabs = [
    { title: 'Overview', href: base },
    { title: 'Content', href: `${base}/content` },
  ];
  if (template.channels.includes('email')) {
    tabs.push({ title: 'Preview', href: `${base}/preview` });
  }

  return (
    <PageHeader
      tabs={isEditing ? undefined : tabs}
      title={template.name}
      rightSection={
        isEditing ? (
          <CloseButton to={base} />
        ) : (
          <>
            <Protected endpoint="templates" permission="update">
              <Button variant="outline" asChild>
                <Link to={`${base}/edit`}>Edit</Link>
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
