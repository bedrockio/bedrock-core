import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Icon } from 'semantic';

import bem from 'helpers/bem';
import screen from 'helpers/screen';

import Confirm from 'components/Confirm';
import EditButton from 'docs/components/EditButton';
import { DocsContext } from 'docs/utils/context';

import { components as markdownComponents } from 'components/Markdown';

import DocsPath from '../../components/DocsPath';

import { DEFAULT_PAGE_ID, pagesByPath, sorted } from '../../pages';

import './api-docs.less';

@bem
@screen
export default class ApiDocs extends React.Component {
  static contextType = DocsContext;

  componentDidMount() {
    const path = this.getDocsPath();
    if (!path) {
      this.props.history.replace(`/docs/${DEFAULT_PAGE_ID}`);
    } else {
      this.checkScroll();
    }
  }

  componentDidUpdate(lastProps) {
    const { pathname, hash } = this.props.location;
    const { pathname: lastPathname, hash: lastHash } = lastProps.location;
    if (pathname !== lastPathname || hash !== lastHash) {
      this.checkScroll(true);
    }
  }

  getDocsPath() {
    const { pathname } = this.props.location;
    return pathname.split('/').slice(2).filter(Boolean).join('/');
  }

  // TODO: This is hacky, fix later
  checkScroll(update) {
    const { hash } = this.props.location;
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({
          behavior: 'smooth',
        });
      }
    } else if (update) {
      const el = document.querySelector('.api-docs__page');
      el.scrollTo(0, 0);
    }
  }

  render() {
    return (
      <div className={this.getBlockClass()}>
        {this.renderSidebar()}
        <main className={this.getElementClass('page')}>
          <Container>{this.renderPage()}</Container>
        </main>
      </div>
    );
  }

  renderSidebar() {
    return (
      <aside className={this.getElementClass('sidebar')}>
        <h2>
          <DocsPath path="info.title" />
        </h2>
        <ul className={this.getElementClass('sidebar-scroll')}>
          {sorted.map((page) => {
            const { id, pages } = page;
            return (
              <li key={id}>
                {this.renderSidebarLink(page)}
                {pages.length > 0 && (
                  <ul className={this.getElementClass('sidebar-subpages')}>
                    {pages
                      .filter((subpage) => {
                        const [prefix] = subpage.path.split('/');
                        const { pathname } = this.props.location;
                        return pathname.startsWith(`/docs/${prefix}`);
                      })
                      .map((subpage) => {
                        return (
                          <React.Fragment key={subpage.id}>
                            {this.renderSidebarLink(subpage)}
                          </React.Fragment>
                        );
                      })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
        {this.renderActions()}
      </aside>
    );
  }

  renderSidebarLink(page) {
    const { title, path } = page;
    const { pathname } = this.props.location;
    const full = `/docs/${path}`;
    const isFocused = pathname === full;
    return (
      <Link
        to={full}
        className={this.getElementClass(
          'sidebar-link',
          isFocused ? 'active' : null
        )}>
        {title}
      </Link>
    );
  }

  renderPage() {
    const path = this.getDocsPath();
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

  renderActions() {
    if (this.context.canEditDocs()) {
      return (
        <div className={this.getElementClass('buttons')}>
          <EditButton />
          <Confirm
            size="small"
            confirmButton="Generate"
            header="Generate Documentation"
            content="Generates OpenApi documentation based on schemas and route validation. This will not overwrite current documentation."
            trigger={
              <Icon link name="arrows-rotate" title="Generate Documentation" />
            }
            onConfirm={this.context.generateDocs}
          />
        </div>
      );
    }
  }
}
