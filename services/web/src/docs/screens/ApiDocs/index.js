import { useLocation, useNavigate } from '@bedrockio/router';
import { useEffect } from 'react';
import { PiArrowClockwiseBold } from 'react-icons/pi';

import { Button } from '@/components/ui/button';

import { useClass } from 'helpers/bem';
import PortalLayout from 'layouts/Portal';

import Footer from 'components/Footer';
import { components as markdownComponents } from 'components/Markdown';
import Meta from 'components/Meta';
import EditButton from 'docs/components/EditButton';
import { useDocs } from 'docs/utils/context';
import Confirm from 'modals/Confirm';

import './api-docs.less';
import { DEFAULT_PAGE_ID, pagesByPath, sorted } from '../../pages';

function getMenuItems(sorted) {
  return sorted.map((page) => {
    const { id, pages } = page;

    return {
      id,
      label: page.title,
      url: `/docs/${page.path}`,
      items: pages.map((subpage) => {
        return {
          id: subpage.id,
          label: subpage.title,
          url: `/docs/${subpage.path}`,
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
          block: 'center',
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

  function renderActions() {
    if (canEditDocs()) {
      return (
        <div className="m-2 flex items-center justify-end gap-2">
          <EditButton />
          <Confirm
            title="Generate Documentation"
            onConfirm={() => {
              return generateDocs();
            }}
            content={
              <p>
                Generates OpenApi documentation based on schemas and route
                validation. This will not overwrite current documentation.
              </p>
            }
            confirmButton="Generate Documentation"
            trigger={
              <Button
                variant="outline"
                size="icon"
                title="Generate Documentation">
                <PiArrowClockwiseBold />
              </Button>
            }
          />
        </div>
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
