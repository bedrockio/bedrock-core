import React, { useEffect } from 'react';

import { Link, useLocation, useNavigate } from '@bedrockio/router';
import { Container } from '@mantine/core';

import { useClass } from 'helpers/bem';

import Confirm from 'components/Confirm';
import EditButton from 'docs/components/EditButton';
import { useDocs } from 'docs/utils/context';

import { components as markdownComponents } from 'components/Markdown';
import Meta from 'components/Meta';

import DocsPath from '../../components/DocsPath';

import { DEFAULT_PAGE_ID, pagesByPath, sorted } from '../../pages';

import './api-docs.less';
import { IconArrowRotaryStraight, IconRefresh } from '@tabler/icons-react';

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

  function render() {
    return (
      <div className={className}>
        <Meta title="API Docs" />
        {renderSidebar()}
        <main className={getElementClass('page')}>
          <Container>{renderPage()}</Container>
        </main>
      </div>
    );
  }

  function renderSidebar() {
    return (
      <aside className={getElementClass('sidebar')}>
        <h2>
          <DocsPath path="info.title" />
        </h2>
        <ul className={getElementClass('sidebar-scroll')}>
          {sorted.map((page) => {
            const { id, pages } = page;
            return (
              <li key={id}>
                {renderSidebarLink(page)}
                {pages.length > 0 && (
                  <ul className={getElementClass('sidebar-subpages')}>
                    {pages
                      .filter((subpage) => {
                        const [prefix] = subpage.path.split('/');
                        return pathname.startsWith(`/docs/${prefix}`);
                      })
                      .map((subpage) => {
                        return (
                          <React.Fragment key={subpage.id}>
                            {renderSidebarLink(subpage)}
                          </React.Fragment>
                        );
                      })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
        {renderActions()}
      </aside>
    );
  }

  function renderSidebarLink(page) {
    const { title, path } = page;
    const full = `/docs/${path}`;
    const isFocused = pathname === full;
    return (
      <Link
        to={full}
        className={getElementClass(
          'sidebar-link',
          isFocused ? 'active' : null,
        )}>
        {title}
      </Link>
    );
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
        <div className={getElementClass('buttons')}>
          <EditButton />
          <Confirm
            size="small"
            confirmButton="Generate"
            header="Generate Documentation"
            content="Generates OpenApi documentation based on schemas and route validation. This will not overwrite current documentation."
            trigger={<IconRefresh title="Generate Documentation" />}
            onConfirm={generateDocs}
          />
        </div>
      );
    }
  }

  return render();
}
