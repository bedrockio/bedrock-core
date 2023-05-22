import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Icon } from 'semantic';

import bem from 'helpers/bem';
import screen from 'helpers/screen';

import { Confirm } from 'components';
import EditButton from 'docs/components/EditButton';
import RecordButton from 'docs/components/RecordButton';
import { DocsContext } from 'docs/utils/context';

import { COMPONENTS } from 'components/Markdown';

import DocsPath from '../../components/DocsPath';

import { DEFAULT_PAGE_ID, pagesById, sorted } from '../../pages';

import './api-docs.less';

@bem
@screen
export default class ApiDocs extends React.Component {
  static layout = 'portal';
  static contextType = DocsContext;

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
                    {pages.map((subpage) => {
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
    const { id, title } = page;
    const path = `/docs/${id}`;
    const isFocused = this.props.history.location.pathname === path;
    return (
      <Link
        to={path}
        className={this.getElementClass(
          'sidebar-link',
          isFocused ? 'active' : null
        )}>
        {title}
      </Link>
    );
  }

  renderPage() {
    const { id } = this.props.match.params;
    if (id) {
      const page = pagesById[id];
      if (page) {
        const { Component } = page;
        return (
          <div className="markdown">
            <Component components={COMPONENTS} />
          </div>
        );
      } else {
        return <div>Not Found!</div>;
      }
    } else {
      this.props.history.replace(`/docs/${DEFAULT_PAGE_ID}`);
    }
  }

  renderActions() {
    if (this.context.canEditDocs()) {
      return (
        <div className={this.getElementClass('buttons')}>
          <RecordButton />
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
