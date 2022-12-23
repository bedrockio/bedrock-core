import React from 'react';
import { Link } from 'react-router-dom';
import { kebabCase, get, set } from 'lodash';
import { Button, Divider, Icon, Loader, Table } from 'semantic';

import screen from 'helpers/screen';
import { request } from 'utils/api';
import bem from 'helpers/bem';

import { JumpLink } from 'components/Link';
import ErrorMessage from 'components/ErrorMessage';

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
      loading: true,
    };
  }

  componentDidMount() {
    this.load();
  }

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

  onGenerateClick = async () => {
    try {
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
    const { docs, mode, loading, error } = this.state;
    if (loading) {
      return <Loader active />;
    }
    return (
      <div className={this.getBlockClass()}>
        <ErrorMessage error={error} />
        <h1>
          {docs.info.title}
          <Icon
            link
            name="pencil"
            style={{
              verticalAlign: 'middle',
              marginLeft: '20px',
            }}
            onClick={() => {
              this.setState({
                mode: mode === 'view' ? 'edit' : 'view',
              });
            }}
          />
        </h1>
        <Button primary onClick={this.onGenerateClick}>
          Generate
        </Button>
        <ul>
          {Object.values(docs.pagesByUrl).map((group) => {
            const { name, url } = group;
            return (
              <li key={name}>
                <Link to={url}>{name}</Link>
              </li>
            );
          })}
        </ul>
        {this.renderPage(docs)}
      </div>
    );
  }

  renderPage(docs) {
    const { mode } = this.state;
    const { pathname } = this.props.location;
    const page = docs.pagesByUrl[pathname];
    if (page) {
      const { name, items } = page;
      return (
        <React.Fragment>
          <h1>{name}</h1>
          <Divider />
          <Divider hidden />
          {items.map((item) => {
            const { verbPath } = item;
            // requestBody // : // {content: {…}}
            // summary // : // "Create a new shop."
            // tags // : // ['Shops']
            // verbPath // : // "POST /1/shops"
            return (
              <React.Fragment key={verbPath}>
                <h2>
                  <code>{verbPath}</code>
                </h2>
                <Divider />
                <h3>
                  <EditableField
                    mode={mode}
                    path={item.path}
                    name="summary"
                    value={item.summary}
                    onSave={this.onFieldSave}
                  />
                </h3>
                <EditableField
                  markdown
                  mode={mode}
                  path={item.path}
                  name="description"
                  value={item.description}
                  onSave={this.onFieldSave}
                />
                <Divider hidden />
                <h3>Request Body</h3>
                {this.renderParams([...item.path, ...PARAMS_PATH])}
              </React.Fragment>
            );
          })}
          {this.renderComponents()}
        </React.Fragment>
      );
    }
  }

  renderParams(path) {
    const { docs, mode } = this.state;
    const params = get(docs, path);
    if (!params) {
      return;
    }
    return (
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Type</Table.HeaderCell>
            <Table.HeaderCell>Required</Table.HeaderCell>
            <Table.HeaderCell width={1}>Default</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {Object.entries(params).map(([name, desc]) => {
            const { description, required, default: defaultValue } = desc;
            return (
              <Table.Row key={name}>
                <Table.Cell>
                  <div style={{ fontSize: '16px' }}>{name}</div>
                  <div style={{ marginTop: '10px' }}>
                    <EditableField
                      markdown
                      mode={mode}
                      path={[...path, name]}
                      name="description"
                      value={description}
                      onSave={this.onFieldSave}
                    />
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div className={this.getElementClass('types')}>
                    {this.renderType(desc)}
                  </div>
                </Table.Cell>
                <Table.Cell>{required ? 'required' : 'optional'}</Table.Cell>
                <Table.Cell>
                  <pre>
                    <code>{JSON.stringify(defaultValue, null, 2)}</code>
                  </pre>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    );
  }

  renderType(desc) {
    const { oneOf, type } = desc;
    if (oneOf) {
      return oneOf
        .map((entry) => {
          const { type, items, $ref } = entry;
          let str;
          if ($ref) {
            const { name } = expandRef($ref);
            str = <JumpLink to={name}>{name}</JumpLink>;
            this.visitedComponents.add($ref);
          } else if (type === 'array') {
            if (items?.type) {
              str = `[${items.type}]`;
            } else {
              str = 'array';
            }
          } else {
            str = entry.type;
          }
          if (str) {
            return <code key={str}>{str}</code>;
          }
        })
        .filter((el) => {
          return el;
        })
        .map((el, i, arr) => {
          const comma = i < arr.length - 1 ? ' | ' : '';
          return (
            <React.Fragment key={i}>
              <span>{el}</span>
              {comma}
            </React.Fragment>
          );
        });
    }
    return <code>{type}</code>;
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
            console.info('ohh', description);
            return (
              <div key={path} id={name}>
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
              </div>
            );
          })}
        </React.Fragment>
      );
    }
  }
}

function expandDocs(docs) {
  const pagesByUrl = {};
  const itemsByUrl = {};
  for (let [path, pathItem] of Object.entries(docs.paths || {})) {
    for (let [method, item] of Object.entries(pathItem || {})) {
      item.path = ['paths', path, method];
      item.verbPath = `${method.toUpperCase()} ${toRouterParams(path)}`;

      let slug = kebabCase(item.summary);
      slug ||= `${method}-${path.split('/').join('-')}`;

      const pageUrl = `/docs/${path.split('/')[2]}`;
      const itemUrl = `${pageUrl}#${slug}`;

      pagesByUrl[pageUrl] ||= {
        url: pageUrl,
        name: item.tags.join(' '),
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

const ROUTER_PARAMS_REG = /\{(.+)}/g;

function toRouterParams(path) {
  return path.replace(ROUTER_PARAMS_REG, ':$1');
}
