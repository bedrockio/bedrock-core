import { Link } from '@bedrockio/router';
import React from 'react';
import { PiPencilSimpleBold } from 'react-icons/pi';

import { usePage } from 'stores/page';

import PageHeader from 'components/PageHeader';
import Protected from 'components/Protected';

import { Button } from '@/components/ui/button';

import Actions from '../Actions';

export default function TemplateMenu({ displayMode }) {
  const { template, reload } = usePage();

  const items = [
    {
      title: 'Home',
      href: '/',
    },
    {
      title: 'Templates',
      href: '/templates',
    },
    {
      title: template.name,
    },
  ];

  const tabs = [
    {
      title: 'Overview',
      href: `/templates/${template.id}`,
    },
    {
      title: 'Content',
      href: `/templates/${template.id}/content`,
    },
  ];

  if (template.channels.includes('email')) {
    tabs.push({
      title: 'Preview',
      href: `/templates/${template.id}/preview`,
    });
  }

  return (
    <React.Fragment>
      <PageHeader
        tabs={tabs}
        title={template.name}
        breadcrumbItems={items}
        rightSection={
          <React.Fragment>
            <Protected endpoint="templates" permission="update">
              <Button variant="outline" asChild>
                <Link to={`/templates/${template.id}/edit`}>
                  Edit
                  <PiPencilSimpleBold />
                </Link>
              </Button>
            </Protected>

            <Actions
              displayMode={displayMode}
              template={template}
              reload={reload}
            />
          </React.Fragment>
        }
      />
    </React.Fragment>
  );
}
