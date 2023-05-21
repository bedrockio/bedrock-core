import { get } from 'lodash';
import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Divider, Icon } from 'semantic';

import bem from 'helpers/bem';
import screen from 'helpers/screen';
import { request } from 'utils/api';

import { Confirm, Layout } from 'components';
import ScrollWaypoint from 'components/ScrollWaypoint';
import EditButton from 'docs/components/EditButton';
import RecordButton from 'docs/components/RecordButton';
import { isRecording, toggleRecording } from 'utils/api/record';
import { DocsContext } from 'docs/utils/context';

import { COMPONENTS } from 'components/Markdown';

import DocsPath from '../../components/DocsPath';

import RequestBuilder from './RequestBuilder';
// import EditableField from './EditableField';

import { DEFAULT_PAGE_ID, pagesById, sorted } from './pages';

const PARAMS_PATH = [
  'requestBody',
  'content',
  'application/json',
  'schema',
  'properties',
];

import './docs.less';

@bem
@screen
export default class Docs extends React.Component {
  static layout = 'portal';
  static contextType = DocsContext;

  constructor(props) {
    super(props);
    this.state = {
      mode: 'view',
      docs: null,
      focused: null,
      recording: isRecording(),
    };
    this.pageRef = React.createRef();
    this.focusedItems = new Map();
  }

  componentDidUpdate(lastProps, lastState) {
    this.checkPageChange(lastProps);
    this.checkLinkFocus(lastState);
  }

  checkPageChange(lastProps) {
    const { location } = this.props;
    const { pathname: path, hash } = location;
    const { pathname: lastPath, hash: lastHash } = lastProps?.location || {};
    if (path !== lastPath) {
      this.focusedItems = new Map();
    }
    if (hash && hash !== lastHash) {
      const el = document.querySelector(hash);
      el?.scrollIntoView(true);
    }
  }

  checkLinkFocus(lastState) {
    const { focused } = this.state;
    const { focused: lastFocused } = lastState;
    if (focused && focused !== lastFocused) {
      const link = document.querySelector(`[data-path="${focused.verbPath}"]`);
      link?.scrollIntoView(true);
    }
  }

  updateFocused = () => {
    const entries = Array.from(this.focusedItems);
    entries.sort((a, b) => {
      const [, el1] = a;
      const [, el2] = b;
      return el1.offsetTop - el2.offsetTop;
    });
    const [entry] = entries;
    this.setState({
      focused: entry ? entry[0] : null,
    });
  };

  // load = async () => {
  //   try {
  //     this.setState({
  //       loading: true,
  //     });
  //     const { data } = await request({
  //       method: 'GET',
  //       path: '/1/docs',
  //     });
  //     const { docs, pages, pagesByUrl } = this.getFullDocs(data);
  //     this.setState({
  //       docs,
  //       pages,
  //       pagesByUrl,
  //       loading: false,
  //     });
  //     this.checkPageChange();
  //   } catch (error) {
  //     this.setState({
  //       error,
  //       loading: false,
  //     });
  //   }
  // };

  // getFullDocs(data) {
  //   const docs = expandDocs(data);

  //   const staticPagesByUrl = {};
  //   for (let [key, data] of Object.entries(PAGES)) {
  //     const slug = kebabCase(data.title || key);
  //     const url = `/docs/${slug}`;
  //     const page = {
  //       url,
  //       type: 'static',
  //       order: data.order,
  //       title: data.title,
  //       group: data.group,
  //       Component: data.default,
  //     };
  //     if (data.group) {
  //       const slug = kebabCase(data.group);
  //       const groupUrl = `/docs/${slug}`;
  //       staticPagesByUrl[groupUrl] ||= {
  //         items: [],
  //       };
  //       staticPagesByUrl[groupUrl].items.push(page);
  //     }
  //     staticPagesByUrl[url] = {
  //       ...staticPagesByUrl[url],
  //       ...page,
  //     };
  //   }

  //   const pagesByUrl = {
  //     ...staticPagesByUrl,
  //     ...docs.pagesByUrl,
  //   };

  //   const pages = Object.values(pagesByUrl).filter((page) => {
  //     return !page.group;
  //   });
  //   pages.sort((a, b) => {
  //     const { order: aOrder = 0, title: aTitle } = a;
  //     const { order: bOrder = 0, title: bTitle } = b;
  //     if (aOrder === bOrder) {
  //       return aTitle.localeCompare(bTitle);
  //     } else {
  //       return aOrder - bOrder;
  //     }
  //   });

  //   return {
  //     docs,
  //     pages,
  //     pagesByUrl,
  //   };
  // }

  // onFieldSave = ({ path, value }) => {
  //   const docs = { ...this.state.docs };
  //   set(docs, path, value);

  //   this.setState({
  //     docs,
  //   });
  // };

  toggleRecordMode = (on) => {
    toggleRecording(on);
    this.setState({
      recording: on,
    });
  };

  onEditClick = () => {
    const { mode } = this.state;
    this.setState({
      mode: mode === 'view' ? 'edit' : 'view',
    });
  };

  onGenerateConfirm = async (close) => {
    try {
      close();
      this.setState({
        loading: true,
      });
      await this.context.generateDocs();
      this.checkPageChange();
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  render() {
    return (
      <div className={this.getBlockClass()}>
        {this.renderSidebar()}
        <main ref={this.pageRef} className={this.getElementClass('page')}>
          <Container>{this.renderPage()}</Container>
        </main>
      </div>
    );
  }

  renderSidebar() {
    const { focused } = this.state;
    return (
      <aside className={this.getElementClass('sidebar')}>
        <h2>
          <DocsPath path="info.title" />
        </h2>
        <ul className={this.getElementClass('sidebar-scroll')}>
          {sorted.map((page) => {
            const { id, title, pages } = page;
            const url = `/docs/${id}`;
            return (
              <li key={id}>
                <Link to={url} className={this.getElementClass('sidebar-link')}>
                  {title}
                </Link>
                {pages.length > 0 && (
                  <ul>
                    {pages
                      .map((subpage) => {
                        const { title, id } = subpage;
                        const isFocused = focused === subpage;
                        const url = `/docs/${id}`;

                        return (
                          <Link
                            to={url}
                            key={id}
                            className={this.getElementClass(
                              'sidebar-sublink',
                              isFocused ? 'active' : null
                            )}>
                            {title}
                          </Link>
                        );
                      })
                      .filter((el) => el)}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
        {this.renderButtons()}
      </aside>
    );
  }

  renderPage() {
    const { id } = this.props.match.params;
    if (id) {
      const page = pagesById[id];
      if (page) {
        const { Component } = page;
        // TODO: cleanup and somehow remove the unneeded div here
        return (
          <React.Fragment>
            <div className="markdown">
              <Component components={COMPONENTS} />
            </div>
          </React.Fragment>
        );
      } else {
        return <div>Not Found!</div>;
      }
    } else {
      this.props.history.replace(`/docs/${DEFAULT_PAGE_ID}`);
    }
  }

  renderDocsPage(docs, page) {
    const { title, items } = page;
    return (
      <React.Fragment>
        <h1>{title}</h1>
        <Divider />
        {items.map((item) => {
          const { verbPath } = item;
          return (
            <React.Fragment key={item.id}>
              <ScrollWaypoint
                id={item.id}
                className={this.getElementClass('item')}
                onEnter={(el) => {
                  this.focusedItems.set(item, el);
                  this.updateFocused();
                }}
                onLeave={() => {
                  this.focusedItems.delete(item);
                  this.updateFocused();
                }}>
                <h2>
                  {/* <EditableField
                    mode={mode}
                    path={item.path}
                    name="summary"
                    value={item.summary}
                    onSave={this.onFieldSave}
                  /> */}
                </h2>
                <Divider hidden />
                <Layout horizontal center spread>
                  <code className={this.getElementClass('item-name')}>
                    {verbPath}
                  </code>
                  <RequestBuilder
                    docs={docs}
                    operation={item}
                    path={item.apiPath}
                    method={item.method}
                    trigger={<Icon name="play" link />}
                  />
                </Layout>
                <Divider hidden />
                {/* <EditableField
                  markdown
                  mode={mode}
                  path={item.path}
                  name="description"
                  value={item.description}
                  onSave={this.onFieldSave}
                /> */}
                {this.renderParams([...item.path, ...PARAMS_PATH])}

                <div className={this.getElementClass('divider')} />
                {/*
                  <RequestBlock
                    authToken={'<token>'}
                    method={item.method}
                    request={{
                      path: item.apiPath,
                      method: 'POST',
                    }}
                  />
                  */}
              </ScrollWaypoint>
              <Divider />
            </React.Fragment>
          );
        })}
        {this.renderComponents()}
      </React.Fragment>
    );
  }

  renderAllowed(desc) {
    const allowed = desc?.enum;
    if (allowed) {
      return (
        <div className={this.getElementClass('param-allowed')}>
          <span className={this.getElementClass('param-allowed-title')}>
            Allowed:{' '}
          </span>
          {allowed.map((val, i) => {
            return (
              <React.Fragment key={val}>
                {i > 0 && ', '}
                {<code>{JSON.stringify(val)}</code>}
              </React.Fragment>
            );
          })}
        </div>
      );
    }
  }

  renderButtons() {
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
          onConfirm={this.onGenerateConfirm}
        />
      </div>
    );
  }

  renderEditButton() {
    const { mode } = this.state;
    return (
      <Icon
        link
        name="pencil"
        title="Toggle Edit Mode"
        className={this.getElementClass(
          'buttons-edit',
          mode === 'edit' ? 'active' : null
        )}
        onClick={this.onEditClick}
      />
    );
  }

  renderRecordButton() {
    const { recording } = this.state;
    if (recording) {
      return (
        <Icon
          link
          name="circle"
          className={this.getElementClass('buttons-record', 'active')}
          onClick={() => {
            this.toggleRecordMode(false);
          }}
        />
      );
    } else {
      return (
        <Confirm
          size="small"
          confirmButton="Enable"
          header="Record Mode"
          content="Turn on record mode. Requests performed will be recorded to documentation."
          trigger={
            <Icon
              link
              name="circle"
              className={this.getElementClass('buttons-record')}
            />
          }
          onConfirm={() => {
            this.toggleRecordMode(true);
          }}
        />
      );
    }
  }
}

function expandRef($ref) {
  const split = $ref.split('/');
  return {
    name: split.at(-1),
    path: split.slice(1),
  };
}
