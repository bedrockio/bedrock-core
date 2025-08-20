import React from 'react';

import { usePage } from 'stores/page';

import PageHeader from 'components/PageHeader';
import Actions from '../Actions';

export default function TemplateMenu({ displayMode }) {
  const { template, reload } = usePage();

  const items = [
    {
      title: 'Home',
      href: '/',
    },
    { title: 'Templates', href: '/templates' },
    { title: template.name },
  ];

  const tabs = [{ title: 'Overview', href: `/templates/${template.id}` }];

  // Add Preview tab only if email channel is available
  if (template.channels.includes('email')) {
    tabs.push({ title: 'Preview', href: `/templates/${template.id}/preview` });
  }

  return (
    <React.Fragment>
      <PageHeader
        title={template.name}
        breadcrumbItems={items}
        rightSection={
          <Actions
            displayMode={displayMode}
            template={template}
            reload={reload}
          />
        }
        tabs={displayMode !== 'edit' && tabs}
      />
    </React.Fragment>
  );
}
