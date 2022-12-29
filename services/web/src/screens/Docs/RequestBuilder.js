import React from 'react';
import { get, set } from 'lodash';
import { Form, Input, Checkbox, Tab, Icon, Dimmer, Loader } from 'semantic';

import { request } from 'utils/api';
import CodeBlock from 'components/Markdown/Code';
import RequestBlock from 'components/RequestBlock';

import bem from 'helpers/bem';

import './request-builder.less';
import ErrorMessage from 'components/ErrorMessage';

// TODO: make nicer
const BODY_PATH = ['requestBody', 'content', 'application/json', 'schema'];

const PROP_ORDER = ['string', 'ObjectId', 'object', 'array'];

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
  constructor(props) {
    super(props);
    this.state = {
      active: false,
      visible: false,
      loading: false,
      request: {},
      activeTab: 0,
    };
  }

  getModifiers() {
    const { active } = this.state;
    return [active ? 'active' : null];
  }

  getPath() {
    const { request } = this.state;
    return this.props.path.replace(/:(\w+)/g, (m, key) => {
      const val = request?.path?.[key];
      return val ? encodeURIComponent(val) : `:${key}`;
    });
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

  onPlayClick = async () => {
    try {
      this.setState({
        error: null,
        loading: true,
      });
      const path = this.getPath();
      const { method } = this.props;
      const { request: options } = this.state;
      const response = await request({
        ...options,
        method,
        path,
      });

      this.setState({
        loading: false,
        response,
        activeTab: 1,
      });
    } catch (error) {
      this.setState({
        error,
        loading: false,
        activeTab: 1,
      });
    }
  };

  onRecordClick = () => {
    console.info('RECORD');
  };

  onTransitionEnd = () => {
    if (!this.state.active) {
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
          className={this.getBlockClass()}
          onTransitionEnd={this.onTransitionEnd}>
          {visible && this.renderMain()}
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

  renderMain() {
    const { method } = this.props;
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
          <h3>
            {method} {this.getPath()}
          </h3>
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
                return <Tab.Pane>{this.renderRequestPanel()}</Tab.Pane>;
              },
            },
            {
              menuItem: 'Response',
              render: () => {
                return <Tab.Pane>{this.renderResponsePanel()}</Tab.Pane>;
              },
            },
            {
              menuItem: 'Output',
              render: () => {
                return <Tab.Pane>{this.renderOutputPanel()}</Tab.Pane>;
              },
            },
          ]}
        />
        <div className={this.getElementClass('footer')}>
          <Icon name="circle" color="red" onClick={this.onRecordClick} />
          <Icon name="play" onClick={this.onPlayClick} />
        </div>
      </React.Fragment>
    );
  }

  renderRequestPanel() {
    return (
      <Form autoComplete="off" autoCorrect="off">
        {this.renderParameters('Path', 'path')}
        {this.renderBody()}
      </Form>
    );
  }

  renderParameters(title, type) {
    const { operation } = this.props;
    const parameters = (operation.parameters || []).filter((p) => {
      return p.in === type;
    });
    if (parameters.length) {
      return (
        <React.Fragment>
          <h4>{title}</h4>
          {parameters.map((param, i) => {
            const path = ['path', param.name];
            return <Form.Field key={i}>{this.renderInput(path)}</Form.Field>;
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
    const { type } = schema;
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
      const { type: aType } = resolveRefs(docs, a[1]);
      const { type: bType } = resolveRefs(docs, b[1]);
      return PROP_ORDER.indexOf(aType) - PROP_ORDER.indexOf(bType);
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
    if (type === 'checkbox') {
      value = checked;
    }
    const request = { ...this.state.request };
    set(request, path, value);
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

  renderResponsePanel() {
    const { response, error } = this.state;
    if (response || error) {
      return (
        <React.Fragment>
          <ErrorMessage error={error} />
          {response && (
            <CodeBlock
              height="60vh"
              language="json"
              source={JSON.stringify(response, null, 2)}
              allowCopy
            />
          )}
        </React.Fragment>
      );
    }
  }

  renderOutputPanel() {
    const { method } = this.props;
    const { request } = this.state;
    return (
      <RequestBlock
        request={{
          method,
          path: this.getPath(),
          body: request?.body,
        }}
      />
    );
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
