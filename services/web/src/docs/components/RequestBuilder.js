import React, { useState, useRef } from 'react';
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

import { useClass } from 'helpers/bem';

import { Code } from '@mantine/core';
import RequestBlock from 'components/RequestBlock';
import { useDocs } from 'docs/utils/context';
import {
  expandRoute,
  getParametersPath,
  getSchemaPath,
  resolveRefs,
} from 'docs/utils';

import './request-builder.less';
import ErrorMessage from 'components/ErrorMessage';

import { request } from 'utils/api';

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

export default function RequestBuilder(props) {
  const { route, trigger } = props;

  const { docs, loadDocs, canEditDocs } = useDocs();

  const [error, setError] = useState(null);
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [req, setReq] = useState({});
  const [res, setRes] = useState({});
  const [activeTab, setActiveTab] = useState(0);

  const { className, getElementClass } = useClass(
    'request-builder',
    active ? 'active' : null,
  );

  const ref = useRef();

  function resolveRoute() {
    let { method, path } = expandRoute(props.route);

    path = path.replace(/:(\w+)/g, (m, key) => {
      const value = req?.path?.[key];
      return value ? encodeURIComponent(value) : `:${key}`;
    });

    path += expandQuery(req.query);

    return { method, path };
  }

  function expandQuery(query) {
    const searchParams = new URLSearchParams();
    for (let [key, value] of Object.entries(query || {})) {
      searchParams.append(key, value);
    }
    const str = searchParams.toString();
    return str ? `?${str}` : '';
  }

  function onTabChange(evt, { activeIndex }) {
    setActiveTab(activeIndex);
  }

  function onTriggerClick() {
    setActive(true);
    setVisible(true);
  }

  function onCloseClick() {
    setActive(false);
  }

  function onPlayClick() {
    performRequest();
  }

  async function onRecordClick() {
    await performRequest({
      headers: {
        'Api-Record': 'on',
      },
    });
    await loadDocs();
  }

  async function performRequest(options) {
    try {
      setError(null);
      setLoading(true);
      setRecorded(false);
      const { method, path } = resolveRoute();

      const response = await request({
        ...req,
        ...options,
        method,
        path,
      });

      setLoading(false);
      setRes(response);
      setActiveTab(1);
      setRecorded(options?.record);
    } catch (error) {
      setLoading(false);
      setRes(error.response);
      setActiveTab(1);
      setRecorded(options?.record);
      setError(!error.response && error);
    }
  }

  function onTransitionEnd(evt) {
    if (!active && (!ref.current || ref.current === evt.target)) {
      setVisible(false);
    }
  }

  function render() {
    return (
      <React.Fragment>
        {renderTrigger()}
        <Dimmer page active={visible} onClick={onCloseClick} />
        <div ref={ref} className={className} onTransitionEnd={onTransitionEnd}>
          {visible && renderPanel()}
        </div>
      </React.Fragment>
    );
  }

  function renderTrigger() {
    return React.cloneElement(trigger, {
      onClick: onTriggerClick,
    });
  }

  function renderPanel() {
    return (
      <React.Fragment>
        <Dimmer inverted active={loading}>
          <Loader />
        </Dimmer>
        <div className={getElementClass('close-button')}>
          <Icon link name="xmark" size="large" onClick={onCloseClick} />
        </div>
        <div className={getElementClass('header')}>
          <h3>{route}</h3>
        </div>
        <Tab
          activeIndex={activeTab}
          onTabChange={onTabChange}
          className={getElementClass('main')}
          menu={{ secondary: true }}
          panes={[
            {
              menuItem: 'Request',
              render: () => {
                return <Tab.Pane>{renderRequestPane()}</Tab.Pane>;
              },
            },
            {
              menuItem: 'Response',
              render: () => {
                return <Tab.Pane>{renderResponsePane()}</Tab.Pane>;
              },
            },
          ]}
        />
        <div className={getElementClass('footer')}>
          {canEditDocs() && (
            <Icon
              name="circle"
              color="red"
              title="Perform request and record as example"
              onClick={onRecordClick}
            />
          )}
          <Icon name="play" onClick={onPlayClick} title="Perform request" />
        </div>
      </React.Fragment>
    );
  }

  function renderRequestPane() {
    return (
      <Form autoComplete="off" autoCorrect="off">
        {renderParameters()}
        {renderQuery()}
        {renderBody()}
        <Divider />
        {renderOutput()}
      </Form>
    );
  }

  function renderParameters() {
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
                {renderInput(path)}
              </Form.Field>
            );
          })}
        </React.Fragment>
      );
    }
  }

  function renderQuery() {
    let parameters = get(docs, getParametersPath(route), []);
    parameters = parameters.filter((p) => {
      return p.in === 'query';
    });
    if (parameters.length) {
      return (
        <React.Fragment>
          <h4>Path</h4>
          {parameters.map((param) => {
            const path = ['query', param.name];
            return (
              <Form.Field key={param.name}>
                <label>{param.name}</label>
                {renderInput(path)}
              </Form.Field>
            );
          })}
        </React.Fragment>
      );
    }
  }

  function renderBody() {
    const schema = get(docs, getSchemaPath(route), {});
    if (schema?.properties) {
      return (
        <React.Fragment>
          <h4>Body</h4>
          {renderSchema(schema, ['body'])}
        </React.Fragment>
      );
    }
  }

  function renderSchema(schema, path, options) {
    schema = resolveRefs(docs, schema);
    const { type, oneOf } = schema;
    if (oneOf) {
      return (
        <OneOfSchema
          schema={schema}
          renderSchema={(schema) => {
            return renderSchema(schema, path, options);
          }}
        />
      );
    }
    switch (type) {
      case 'object':
        return renderObjectSchema(schema, path, options);
      case 'array':
        return renderArraySchema(schema, path, options);
      case 'number':
        return renderNumberSchema(schema, path, options);
      case 'boolean':
        return renderBooleanSchema(schema, path, options);
      case 'string':
      case 'ObjectId':
        return renderStringSchema(schema, path, options);
      default:
        throw new Error(`Cannot find type ${type}.`);
    }
  }

  function renderObjectSchema(schema, path) {
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
                        {renderSchema(schema, [...path, key])}
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
                    const values = get(req, p, []);
                    set(req, p, [...values, undefined]);
                    setReq({ ...req });
                  }}
                />
              </label>
              {renderSchema(schema, [...path, key])}
            </React.Fragment>
          ) : (
            <React.Fragment>
              <label>{key}</label>
              {renderSchema(schema, [...path, key])}
            </React.Fragment>
          )}
        </Form.Field>
      );
    });
  }

  function renderArraySchema(schema, path, options) {
    const { items } = schema;
    const values = get(req, path, []);
    return (
      <React.Fragment>
        {values.map((value, i) => {
          return (
            <Form.Field key={i}>
              {renderSchema(items, [...path, i], {
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
                      set(req, path, updated);
                      setReq({ ...req });
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

  function setField(evt, { type, path, value, checked }) {
    if (type === 'number') {
      value = Number(value);
    } else if (type === 'checkbox') {
      value = checked;
    }
    set(req, path, value || undefined);
    setReq({ ...req });
  }

  function renderStringSchema(schema, path, options) {
    return renderInput(path, options);
  }

  function renderNumberSchema(schema, path, options) {
    return renderInput(path, {
      ...options,
      type: 'number',
    });
  }

  function renderBooleanSchema(schema, path, options) {
    return renderCheckbox(path, options);
  }

  function renderInput(path, options) {
    const value = get(req, path);
    return (
      <Input
        {...options}
        path={path}
        value={value || ''}
        onChange={setField}
        autoComplete="chrome-off"
        spellCheck="false"
      />
    );
  }

  function renderCheckbox(path, options) {
    const value = get(req, path);
    return (
      <Checkbox
        toggle
        path={path}
        checked={value || false}
        onChange={setField}
        {...options}
      />
    );
  }

  function renderOutput() {
    const { method, path } = resolveRoute();
    return (
      <RequestBlock
        request={{
          method,
          path,
          body: req?.body,
        }}
      />
    );
  }

  function renderResponsePane() {
    if (res || error) {
      return (
        <React.Fragment>
          <ErrorMessage error={error} />
          {res && <Code language="json">{JSON.stringify(res, null, 2)}</Code>}
          {recorded && (
            <div className={getElementClass('response-recorded')}>
              Response Recorded
            </div>
          )}
        </React.Fragment>
      );
    }
  }

  return render();
}

function Collapsable(props) {
  const { children } = props;

  const [open, setOpen] = useState(false);

  function toggle() {
    setOpen(!open);
  }

  function render() {
    return children({
      open,
      toggle,
    });
  }

  return render();
}

function OneOfSchema(props) {
  const { schema, renderSchema } = props;

  const [selected, setSelected] = useState(0);

  function onDropdownChange(evt, { value }) {
    setSelected(value);
  }

  function render() {
    const { oneOf = [] } = schema;
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
          onChange={onDropdownChange}
        />
        {renderSchema(oneOf[selected])}
      </React.Fragment>
    );
  }

  return render();
}

function getRank(key, obj) {
  let rank = obj[key];
  if (typeof rank !== 'number') {
    rank = obj['default'];
  }
  return rank;
}
