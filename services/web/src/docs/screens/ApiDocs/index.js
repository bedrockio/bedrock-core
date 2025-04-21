import { useEffect } from 'react';

import { useLocation, useNavigate } from '@bedrockio/router';
import { ActionIcon, Group, Text } from '@mantine/core';
import { modals } from '@mantine/modals';

import { useClass } from 'helpers/bem';

import ConfirmModal from 'components/ConfirmModal';
import EditButton from 'docs/components/EditButton';
import { useDocs } from 'docs/utils/context';

import { components as markdownComponents } from 'components/Markdown';
import Meta from 'components/Meta';

import { DEFAULT_PAGE_ID, pagesByPath, sorted } from '../../pages';

import './api-docs.less';
import { IconRefresh } from '@tabler/icons-react';
import PortalLayout from 'layouts/Portal';
import Footer from 'components/Footer';

function getMenuItems(sorted) {
  return sorted.map((page) => {
    const { id, pages } = page;

    return {
      id,
      label: page.title,
      href: `/docs/${page.path}`,
      items: pages.map((subpage) => {
        return {
          id: subpage.id,
          label: subpage.title,
          href: `/docs/${subpage.path}`,
        };
      }),
    };
  });
}

export default function ApiDocs() {
  const { className, getElementClass } = useClass('api-docs');

  const { pathname, hash } = useLocation();
  const navigate = useNavigate();

  const { canEditDocs, generateDocs } = useDocs();

  useEffect(() => {
    const path = getDocsPath();
    if (!path) {
      navigate.replace(`/docs/${DEFAULT_PAGE_ID}`);
    } else {
      checkScroll();
    }
  }, [pathname, hash]);

  function getDocsPath() {
    return pathname.split('/').slice(2).filter(Boolean).join('/');
  }

  // TODO: This is hacky, fix later
  function checkScroll() {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({
          behavior: 'smooth',
        });
      }
    } else {
      const el = document.querySelector('.api-docs__page');
      el.scrollTo(0, 0);
    }
  }

  function renderPage() {
    const path = getDocsPath();
    if (path) {
      const page = pagesByPath[path];
      if (page) {
        const { Component } = page;
        return (
          <div className="markdown">
            <Component components={markdownComponents} />
          </div>
        );
      } else {
        return <div>Not Found!</div>;
      }
    }
  }

  function confirmGenerate() {
    modals.open({
      title: `Generate Documentation`,
      children: (
        <ConfirmModal
          onConfirm={() => {
            return generateDocs();
          }}
          content={
            <Text>
              Generates OpenApi documentation based on schemas and route
              validation. This will not overwrite current documentation.
            </Text>
          }
          confirmButton="Generate Documentation"
        />
      ),
    });
  }

  function renderActions() {
    if (canEditDocs()) {
      return (
        <Group gap="xs" justify="flex-end" m="xs">
          <EditButton />
          <ActionIcon
            onClick={confirmGenerate}
            variant="default"
            title="Generate Documentation">
            <IconRefresh size={14} />
          </ActionIcon>
        </Group>
      );
    }
  }

  return (
    <PortalLayout menuItems={getMenuItems(sorted)} actions={renderActions()}>
      <div className={className}>
        <Meta title="API Docs" />
        <main className={getElementClass('page')}>{renderPage()}</main>
        <Footer />
      </div>
    </PortalLayout>
  );
}
