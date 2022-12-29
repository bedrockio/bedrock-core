import React from 'react';
import { Link } from 'react-router-dom';
import { get, kebabCase, set } from 'lodash';
import { Container, Dimmer, Divider, Icon, Loader } from 'semantic';

import bem from 'helpers/bem';
import screen from 'helpers/screen';
import { request } from 'utils/api';

import { Layout, Confirm } from 'components';
import { JumpLink } from 'components/Link';
import ErrorMessage from 'components/ErrorMessage';
import ScrollWaypoint from 'components/ScrollWaypoint';
import { toggleRecording, isRecording } from 'utils/api/record';
import CodeBlock from 'components/Markdown/Code';

import RequestBuilder from './RequestBuilder';
import EditableField from './EditableField';

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

  constructor(props) {
    super(props);
    this.state = {
      mode: 'view',
      docs: null,
      focused: null,
      loading: true,
      recording: isRecording(),
    };
    this.pageRef = React.createRef();
    this.focusedItems = new Map();
  }

  componentDidMount() {
    this.load();
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

  load = async () => {
    try {
      this.setState({
        loading: true,
      });
      const { data } = await request({
        method: 'GET',
        path: '/1/docs',
      });
      this.visitedComponents = new Set();
      this.setState({
        docs: expandDocs(data),
        loading: false,
      });
      this.checkPageChange();
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  onFieldSave = ({ path, value }) => {
    const docs = { ...this.state.docs };
    set(docs, path, value);

    this.setState({
      docs,
    });
  };

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
      const { data } = await request({
        method: 'POST',
        path: '/1/docs/generate',
      });
      this.setState({
        docs: expandDocs(data),
        loading: false,
      });
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  };

  render() {
    const { docs, loading } = this.state;
    return (
      <div className={this.getBlockClass()}>
        {loading && (
          <Dimmer inverted active>
            <Loader />
          </Dimmer>
        )}
        {docs && (
          <React.Fragment>
            {this.renderSidebar(docs)}
            {this.renderPage(docs)}
          </React.Fragment>
        )}
      </div>
    );
  }

  renderSidebar(docs) {
    const { focused } = this.state;
    const pages = Object.values(docs.pagesByUrl);
    pages.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
    return (
      <aside className={this.getElementClass('sidebar')}>
        <h2>{docs.info?.title}</h2>
        <ul className={this.getElementClass('sidebar-scroll')}>
          {pages.map((group) => {
            const { name, url, items } = group;
            return (
              <li key={name}>
                <Link to={url} className={this.getElementClass('sidebar-link')}>
                  {name}
                </Link>
                <ul>
                  {items
                    .map((item) => {
                      const { summary } = item;
                      const isFocused = focused === item;
                      if (summary) {
                        return (
                          <Link
                            to={item.url}
                            key={item.verbPath}
                            data-path={item.verbPath}
                            className={this.getElementClass(
                              'sidebar-sublink',
                              isFocused ? 'active' : null
                            )}>
                            {summary}
                          </Link>
                        );
                      }
                    })
                    .filter((el) => el)}
                </ul>
              </li>
            );
          })}
        </ul>
        {this.renderButtons()}
      </aside>
    );
  }

  renderPage(docs) {
    const { mode, error } = this.state;
    const { pathname } = this.props.location;
    const page = docs.pagesByUrl[pathname];
    if (page) {
      const { name, items } = page;
      return (
        <main ref={this.pageRef} className={this.getElementClass('page')}>
          <Container>
            <ErrorMessage error={error} />
            <h1>{name}</h1>
            <Divider />
            {items.map((item) => {
              const { verbPath } = item;
              return (
                <React.Fragment key={item.slug}>
                  <ScrollWaypoint
                    id={item.slug}
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
                      <EditableField
                        mode={mode}
                        path={item.path}
                        name="summary"
                        value={item.summary}
                        onSave={this.onFieldSave}
                      />
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
                    <EditableField
                      markdown
                      mode={mode}
                      path={item.path}
                      name="description"
                      value={item.description}
                      onSave={this.onFieldSave}
                    />
                    {this.renderParams([...item.path, ...PARAMS_PATH])}

                    <div className={this.getElementClass('divider')} />
                    {this.renderExamples(item)}
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
          </Container>
        </main>
      );
    }
  }

  renderParams(path) {
    const { docs, mode } = this.state;
    const params = get(docs, path);
    if (!params) {
      return;
    }
    const entries = Object.entries(params);
    entries.sort((a, b) => {
      const aRequired = a[1].required || false;
      const bRequired = b[1].required || false;
      return bRequired - aRequired;
    });
    return (
      <table className={this.getElementClass('params')}>
        <tbody>
          {entries.map(([name, desc]) => {
            const { description, required, default: defaultValue } = desc;
            return (
              <tr key={name}>
                <td className={this.getElementClass('param-pointer')} />
                <td className={this.getElementClass('param-name')}>
                  <code>{name}</code>
                </td>
                <td className={this.getElementClass('param-description')}>
                  <div className={this.getElementClass('types')}>
                    {this.renderType(desc)}
                  </div>

                  {required && (
                    <div className={this.getElementClass('param-required')}>
                      Required
                    </div>
                  )}
                  {description && (
                    <div className={this.getElementClass('divider')} />
                  )}

                  <EditableField
                    markdown
                    mode={mode}
                    path={[...path, name]}
                    name="description"
                    value={description}
                    onSave={this.onFieldSave}
                  />
                  {defaultValue !== undefined && (
                    <div className={this.getElementClass('divider')} />
                  )}
                  {this.renderDefault(defaultValue)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  renderType(desc, isArray = false) {
    const { type, $ref, oneOf, enum: allowed } = desc;
    if (oneOf) {
      return oneOf.map((entry, i) => {
        const comma = i > 0 ? ', ' : '';
        return (
          <React.Fragment key={i}>
            {comma}
            {this.renderType(entry)}
          </React.Fragment>
        );
      });
    } else if (type === 'array') {
      return this.renderType(desc.items, '[]');
    } else if ($ref) {
      this.visitedComponents.add($ref);
      const { name } = expandRef($ref);
      return <JumpLink to={name}>{isArray ? `[${name}]` : name}</JumpLink>;
    } else if (allowed) {
      if (isArray) {
        return (
          <code>
            [
            {allowed
              .map((val) => {
                return JSON.stringify(val);
              })
              .join(' | ')}
            ]
          </code>
        );
      } else {
        return allowed.map((val, i) => {
          return (
            <React.Fragment key={val}>
              {i > 0 && ', '}
              <code>{JSON.stringify(val)}</code>
            </React.Fragment>
          );
        });
      }
    } else if (type) {
      return <span>{isArray ? `[${type}]` : type}</span>;
    } else {
      return <span>any</span>;
    }
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

  renderDefault(defaultValue) {
    if (defaultValue && typeof defaultValue === 'object') {
      return (
        <div className={this.getElementClass('param-default')}>
          <div className={this.getElementClass('param-default-title')}>
            Default:
          </div>
          <pre>
            <code>{JSON.stringify(defaultValue, null, 2)}</code>
          </pre>
        </div>
      );
    } else if (defaultValue !== undefined) {
      return (
        <div className={this.getElementClass('param-default')}>
          <span className={this.getElementClass('param-default-title')}>
            Default:
          </span>{' '}
          <code>{JSON.stringify(defaultValue, null, 2)}</code>
        </div>
      );
    }
  }

  renderExamples(item) {
    const items = Object.entries(item.responses || {})
      .flatMap(([status, response]) => {
        status = parseInt(status);
        const { schema, examples = {} } = get(
          response,
          ['content', 'application/json'],
          {}
        );
        if (schema?.$ref) {
          this.visitedComponents.add(schema.$ref);
        }
        const exampleResponses = Object.entries(examples).map(
          ([id, example]) => {
            const examples = get(
              item,
              ['requestBody', 'content', 'application/json', 'examples'],
              {}
            );
            return {
              status,
              schema,
              requestBody: examples[id]?.value,
              responseBody: example.value,
            };
          }
        );
        if (exampleResponses.length) {
          return exampleResponses;
        } else {
          return [
            {
              status,
              schema,
            },
          ];
        }
      })
      .sort((a, b) => {
        return a.status < b.status;
      });
    if (items.length) {
      return (
        <React.Fragment>
          <h4>Examples:</h4>
          {items.map((item, i) => {
            return <DocsExample key={i} item={item} />;
          })}
        </React.Fragment>
      );
    }
  }

  renderComponents() {
    const { mode, docs } = this.state;
    if (this.visitedComponents.size) {
      return (
        <React.Fragment>
          <h3>Components</h3>
          <Divider />
          {Array.from(this.visitedComponents).map(($ref) => {
            const { name, path } = expandRef($ref);
            const { description } = get(docs, path);
            return (
              <div
                id={name}
                key={name}
                className={this.getElementClass('component')}>
                <h3>{name}</h3>
                <EditableField
                  markdown
                  mode={mode}
                  path={path}
                  name="description"
                  value={description}
                  onSave={this.onFieldSave}
                />
                {this.renderParams([...path, 'properties'])}
                <Divider />
              </div>
            );
          })}
        </React.Fragment>
      );
    }
  }

  renderButtons() {
    return (
      <div className={this.getElementClass('buttons')}>
        {this.renderRecordButton()}
        {this.renderEditButton()}
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

@bem
class DocsExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }

  isGood() {
    const { status } = this.props.item;
    return status >= 200 && status <= 300;
  }

  onToggleClick = () => {
    this.setState({
      open: !this.state.open,
    });
  };

  render() {
    const { open } = this.state;
    const { status, schema, requestBody, responseBody } = this.props.item;
    return (
      <div className={this.getBlockClass()}>
        <Layout
          horizontal
          center
          spread
          className={this.getElementClass(
            'title',
            this.isGood() ? 'good' : 'bad'
          )}
          onClick={this.onToggleClick}>
          <Layout.Group>{status}</Layout.Group>
          <Layout.Group>
            <Icon size="small" name={open ? 'minus' : 'plus'} link />
          </Layout.Group>
        </Layout>
        {open && (
          <React.Fragment>
            {this.renderSchema(schema)}
            {this.renderBody('Request Body:', requestBody)}
            {this.renderBody('Response Body:', responseBody)}
          </React.Fragment>
        )}
      </div>
    );
  }

  renderSchema(schema) {
    if (schema) {
      const { $ref } = schema;
      const { name } = expandRef($ref);
      return (
        <div className={this.getElementClass('schema')}>
          Returns: <JumpLink to={name}>{name}</JumpLink>
        </div>
      );
    }
  }

  renderBody(title, body = {}) {
    const keys = Object.keys(body);
    if (keys.length) {
      return (
        <div className={this.getElementClass('body')}>
          <div>{title}</div>
          <CodeBlock
            language="json"
            source={JSON.stringify(body, null, 2)}
            allowCopy
          />
        </div>
      );
    }
  }
}

function expandDocs(docs) {
  const pagesByUrl = {};
  const itemsByUrl = {};
  for (let [apiPath, pathItem] of Object.entries(docs.paths || {})) {
    for (let [method, item] of Object.entries(pathItem || {})) {
      item.path = ['paths', apiPath, method];

      method = method.toUpperCase();

      item.method = method;
      item.apiPath = apiPath;
      item.verbPath = `${method} ${apiPath}`;

      let slug = kebabCase(item.summary);
      slug ||= `${method}-${apiPath.split('/').join('-')}`;

      const pageUrl = `/docs/${apiPath.split('/')[2]}`;
      const itemUrl = `${pageUrl}#${slug}`;

      item.slug = slug;
      item.url = itemUrl;
      pagesByUrl[pageUrl] ||= {
        url: pageUrl,
        name: item['x-group'] || '<GROUP>',
        items: [],
      };
      pagesByUrl[pageUrl].items.push(item);

      itemsByUrl[itemUrl] = item;
    }
  }
  return {
    pagesByUrl,
    itemsByUrl,
    ...docs,
  };
}

function expandRef($ref) {
  const split = $ref.split('/');
  return {
    name: split.at(-1),
    path: split.slice(1),
  };
}
