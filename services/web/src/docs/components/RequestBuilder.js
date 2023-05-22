import React from 'react';
import { get, set } from 'lodash';
import {
  Form,
  Input,
  Dropdown,
  Checkbox,
  Tab,
  Icon,
  Dimmer,
  Loader,
  Divider,
} from 'semantic';

import { request } from 'utils/api';
import Code from 'components/Code';
import RequestBlock from 'components/RequestBlock';
import { DocsContext } from 'docs/utils/context';
import { expandRoute, getParametersPath } from 'docs/utils';

import bem from 'helpers/bem';

import './request-builder.less';
import ErrorMessage from 'components/ErrorMessage';

// TODO: make nicer
const BODY_PATH = ['requestBody', 'content', 'application/json', 'schema'];

const NAME_RANK = {
  keyword: 0,
  default: 1,
};

const TYPE_RANK = {
  boolean: 1,
  default: 2,
  ObjectId: 3,
  object: 4,
  array: 5,
};

function resolveRefs(docs, schema) {
  const { $ref } = schema;
  if ($ref) {
    const path = $ref.split('/').slice(1).join('.');
    return get(docs, path);
  } else {
    return schema;
  }
}

@bem
export default class RequestBuilder extends React.Component {
  static contextType = DocsContext;

  constructor(props) {
    super(props);
    this.state = {
      active: false,
      visible: false,
      loading: false,
      recorded: false,
      request: {},
      activeTab: 0,
    };
    this.ref = React.createRef();
  }

  getModifiers() {
    const { active } = this.state;
    return [active ? 'active' : null];
  }

  expandRoute() {
    const { request } = this.state;
    let { method, path } = expandRoute(this.props.route);

    path = path.replace(/:(\w+)/g, (m, key) => {
      const value = request?.path?.[key];
      return value ? encodeURIComponent(value) : `:${key}`;
    });
    return { method, path };
  }

  onTabChange = (evt, { activeIndex }) => {
    this.setState({
      activeTab: activeIndex,
    });
  };

  onTriggerClick = () => {
    this.setState({
      active: true,
      visible: true,
    });
  };

  onCloseClick = () => {
    this.setState({
      active: false,
    });
  };

  onPlayClick = () => {
    this.performRequest();
  };

  onRecordClick = async () => {
    await this.performRequest({
      record: true,
    });
    await this.context.loadDocs();
  };

  performRequest = async (options) => {
    try {
      this.setState({
        error: null,
        loading: true,
        recorded: false,
      });
      const { method, path } = this.expandRoute();

      const response = await request({
        ...this.state.request,
        ...options,
        method,
        path,
      });

      this.setState({
        loading: false,
        response,
        activeTab: 1,
        recorded: options?.record,
      });
    } catch (error) {
      this.setState({
        response: error.response,
        error: !error.response && error,
        loading: false,
        activeTab: 1,
        recorded: options?.record,
      });
    }
  };

  onTransitionEnd = (evt) => {
    if (
      !this.state.active &&
      (!this.ref.current || this.ref.current === evt.target)
    ) {
      this.setState({
        visible: false,
      });
    }
  };

  render() {
    const { visible } = this.state;
    return (
      <React.Fragment>
        {this.renderTrigger()}
        <Dimmer page active={visible} onClick={this.onCloseClick} />
        <div
          ref={this.ref}
          className={this.getBlockClass()}
          onTransitionEnd={this.onTransitionEnd}>
          {visible && this.renderPanel()}
        </div>
      </React.Fragment>
    );
  }

  renderTrigger() {
    const { trigger } = this.props;
    return React.cloneElement(trigger, {
      onClick: this.onTriggerClick,
    });
  }

  renderPanel() {
    const { route } = this.props;
    const { activeTab, loading } = this.state;
    return (
      <React.Fragment>
        <Dimmer inverted active={loading}>
          <Loader />
        </Dimmer>
        <div className={this.getElementClass('close-button')}>
          <Icon link name="xmark" size="large" onClick={this.onCloseClick} />
        </div>
        <div className={this.getElementClass('header')}>
          <h3>{route}</h3>
        </div>
        <Tab
          activeIndex={activeTab}
          onTabChange={this.onTabChange}
          className={this.getElementClass('main')}
          menu={{ secondary: true }}
          panes={[
            {
              menuItem: 'Request',
              render: () => {
                return <Tab.Pane>{this.renderRequestPane()}</Tab.Pane>;
              },
            },
            {
              menuItem: 'Response',
              render: () => {
                return <Tab.Pane>{this.renderResponsePane()}</Tab.Pane>;
              },
            },
          ]}
        />
        <div className={this.getElementClass('footer')}>
          {this.context.canEditDocs() && (
            <Icon
              name="circle"
              color="red"
              title="Perform request and record as example"
              onClick={this.onRecordClick}
            />
          )}
          <Icon
            name="play"
            onClick={this.onPlayClick}
            title="Perform request"
          />
        </div>
      </React.Fragment>
    );
  }

  renderRequestPane() {
    return (
      <Form autoComplete="off" autoCorrect="off">
        {this.renderParameters()}
        {this.renderBody()}
        <Divider />
        {this.renderOutput()}
      </Form>
    );
  }

  renderParameters() {
    const { route } = this.props;
    const { docs } = this.context;
    let parameters = get(docs, getParametersPath(route), []);
    parameters = parameters.filter((p) => {
      return p.in === 'path';
    });
    if (parameters.length) {
      return (
        <React.Fragment>
          <h4>Path</h4>
          {parameters.map((param) => {
            const path = ['path', param.name];
            return (
              <Form.Field key={param.name}>
                <label>{param.name}</label>
                {this.renderInput(path)}
              </Form.Field>
            );
          })}
        </React.Fragment>
      );
    }
  }

  renderBody() {
    const { operation } = this.props;
    const schema = get(operation, BODY_PATH);
    if (schema) {
      return (
        <React.Fragment>
          <h4>Body</h4>
          {this.renderSchema(schema, ['body'])}
        </React.Fragment>
      );
    }
  }

  renderSchema(schema, path, options) {
    const { docs } = this.props;
    schema = resolveRefs(docs, schema);
    const { type, oneOf } = schema;
    if (oneOf) {
      return (
        <OneOfSchema
          schema={schema}
          renderSchema={(schema) => {
            return this.renderSchema(schema, path, options);
          }}
        />
      );
    }
    switch (type) {
      case 'object':
        return this.renderObjectSchema(schema, path, options);
      case 'array':
        return this.renderArraySchema(schema, path, options);
      case 'number':
        return this.renderNumberSchema(schema, path, options);
      case 'boolean':
        return this.renderBooleanSchema(schema, path, options);
      case 'string':
      case 'ObjectId':
        return this.renderStringSchema(schema, path, options);
      default:
        throw new Error('NO TYPE' + type);
    }
  }

  renderObjectSchema(schema, path) {
    const { docs } = this.props;
    const { properties } = schema;
    const entries = Object.entries(properties);
    entries.sort((a, b) => {
      const aName = a[0];
      const bName = b[0];
      const { type: aType } = resolveRefs(docs, a[1]);
      const { type: bType } = resolveRefs(docs, b[1]);
      const aN = getRank(aName, NAME_RANK);
      const bN = getRank(bName, NAME_RANK);
      if (aN !== bN) {
        return aN - bN;
      } else {
        return getRank(aType, TYPE_RANK) - getRank(bType, TYPE_RANK);
      }
    });
    return entries.map(([key, schema]) => {
      schema = resolveRefs(docs, schema);
      const { type } = schema;
      return (
        <Form.Field key={key}>
          {type === 'object' ? (
            <Collapsable>
              {({ open, toggle }) => {
                return (
                  <React.Fragment>
                    <label style={{ marginBottom: '1em' }}>
                      {key}{' '}
                      <Icon
                        size="small"
                        name={open ? 'minus' : 'plus'}
                        onClick={toggle}
                        link
                      />
                    </label>
                    {open && (
                      <div className="indent lined">
                        {this.renderSchema(schema, [...path, key])}
                      </div>
                    )}
                  </React.Fragment>
                );
              }}
            </Collapsable>
          ) : type === 'array' ? (
            <React.Fragment>
              <label style={{ marginBottom: '1em' }}>
                {key}{' '}
                <Icon
                  link
                  size="small"
                  name="plus"
                  style={{
                    marginLeft: '0.3em',
                  }}
                  onClick={() => {
                    const p = [...path, key];
                    const { request } = this.state;
                    const values = get(request, p, []);
                    set(request, p, [...values, undefined]);
                    this.setState({
                      request: {
                        ...this.state.request,
                      },
                    });
                  }}
                />
              </label>
              {this.renderSchema(schema, [...path, key])}
            </React.Fragment>
          ) : (
            <React.Fragment>
              <label>{key}</label>
              {this.renderSchema(schema, [...path, key])}
            </React.Fragment>
          )}
        </Form.Field>
      );
    });
  }

  renderArraySchema(schema, path, options) {
    const { request } = this.state;
    const { items } = schema;
    const values = get(request, path, []);
    return (
      <React.Fragment>
        {values.map((value, i) => {
          return (
            <Form.Field key={i}>
              {this.renderSchema(items, [...path, i], {
                ...options,
                icon: (
                  <Icon
                    link
                    size="small"
                    name="xmark"
                    onClick={() => {
                      const updated = values.filter((value, j) => {
                        return j !== i;
                      });
                      set(request, path, updated);
                      this.setState({
                        request: {
                          ...this.state.request,
                        },
                      });
                    }}
                  />
                ),
              })}
            </Form.Field>
          );
        })}
      </React.Fragment>
    );
  }

  setField = (evt, { type, path, value, checked }) => {
    if (type === 'number') {
      value = Number(value);
    } else if (type === 'checkbox') {
      value = checked;
    }
    const request = { ...this.state.request };
    set(request, path, value || undefined);
    this.setState({
      request,
    });
  };

  renderStringSchema(schema, path, options) {
    return this.renderInput(path, options);
  }

  renderNumberSchema(schema, path, options) {
    return this.renderInput(path, {
      ...options,
      type: 'number',
    });
  }

  renderBooleanSchema(schema, path, options) {
    return this.renderCheckbox(path, options);
  }

  renderInput(path, options) {
    const { request } = this.state;
    const value = get(request, path);
    return (
      <Input
        {...options}
        path={path}
        value={value || ''}
        onChange={this.setField}
        autoComplete="chrome-off"
        spellCheck="false"
      />
    );
  }

  renderCheckbox(path, options) {
    const { request } = this.state;
    const value = get(request, path);
    return (
      <Checkbox
        toggle
        path={path}
        checked={value || false}
        onChange={this.setField}
        {...options}
      />
    );
  }

  renderOutput() {
    const { request } = this.state;
    const { method, path } = this.expandRoute();
    return (
      <RequestBlock
        request={{
          method,
          path,
          body: request?.body,
        }}
      />
    );
  }

  renderResponsePane() {
    const { response, recorded, error } = this.state;
    if (response || error) {
      return (
        <React.Fragment>
          <ErrorMessage error={error} />
          {response && (
            <Code language="json">{JSON.stringify(response, null, 2)}</Code>
          )}
          {recorded && (
            <div className={this.getElementClass('response-recorded')}>
              Response Recorded
            </div>
          )}
        </React.Fragment>
      );
    }
  }
}

class Collapsable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }

  toggle = () => {
    this.setState({
      open: !this.state.open,
    });
  };

  render() {
    const { children } = this.props;
    const { open } = this.state;
    return children({
      open,
      toggle: this.toggle,
    });
  }
}

class OneOfSchema extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: 0,
    };
  }

  onDropdownChange = (evt, { value }) => {
    this.setState({
      selected: value,
    });
  };

  render() {
    const { schema, renderSchema } = this.props;
    const { oneOf = [] } = schema;
    const { selected } = this.state;
    return (
      <React.Fragment>
        <Dropdown
          value={selected}
          options={oneOf.map((schema, i) => {
            return {
              text: schema.type,
              value: i,
            };
          })}
          onChange={this.onDropdownChange}
        />
        {renderSchema(oneOf[selected])}
      </React.Fragment>
    );
  }
}

function getRank(key, obj) {
  let rank = obj[key];
  if (typeof rank !== 'number') {
    rank = obj['default'];
  }
  return rank;
}
