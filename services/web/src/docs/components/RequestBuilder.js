import {
  ActionIcon,
  Affix,
  Divider,
  Drawer,
  Fieldset,
  Group,
  LoadingOverlay,
  Paper,
  SegmentedControl,
  Stack,
  Switch,
  Tabs,
  Text,
  TextInput,
} from '@mantine/core';

import { useDisclosure } from '@mantine/hooks';
import { get, set } from 'lodash';
import React, { useState } from 'react';

import {
  PiMinus,
  PiPlayBold,
  PiPlus,
  PiRecordBold,
  PiTrashBold,
} from 'react-icons/pi';

import Code from 'components/Code';
import ErrorMessage from 'components/ErrorMessage';
import RequestBlock from 'components/RequestBlock';

import {
  expandRoute,
  getParametersPath,
  getSchemaPath,
  resolveRefs,
} from 'docs/utils';

import { useDocs } from 'docs/utils/context';

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
  const [opened, { open, close }] = useDisclosure(false);

  const { route, trigger } = props;

  const { docs, loadDocs, canEditDocs } = useDocs();

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [req, setReq] = useState({});
  const [res, setRes] = useState({});
  const [activeTab, setActiveTab] = useState(0);

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

  function renderRequestPane() {
    return (
      <form autoComplete="off" autoCorrect="off">
        <Stack>
          {renderParameters()}
          {renderQuery()}
          {renderBody()}
          <Divider />
          {renderOutput()}
        </Stack>
      </form>
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
            return renderInput(path, {
              label: param.name,
            });
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
            return renderInput(path, { label: param.name });
          })}
        </React.Fragment>
      );
    }
  }

  function renderBody() {
    const schema = get(docs, getSchemaPath(route), {});
    if (schema?.properties) {
      return (
        <>
          <Text size="sm" fw="bold">
            Body
          </Text>
          {renderSchema(schema, ['body'])}
        </>
      );
    }
  }

  function renderSchema(schema, path, options) {
    schema = resolveRefs(docs, schema);
    const { type, anyOf } = schema;
    if (anyOf) {
      return (
        <AnyOfSchema
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
        <div key={key}>
          {type === 'object' ? (
            <Collapsable>
              {({ open, toggle }) => {
                return (
                  <React.Fragment>
                    <label style={{ marginBottom: '1em' }}>
                      {key}{' '}
                      <ActionIcon variant="default" onClick={toggle}>
                        {open ? <PiMinus /> : <PiPlus />}
                      </ActionIcon>
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
                <ActionIcon
                  variant="default"
                  onClick={() => {
                    const p = [...path, key];
                    const values = get(req, p, []);
                    set(req, p, [...values, undefined]);
                    setReq({ ...req });
                  }}>
                  <PiPlus />
                </ActionIcon>
              </label>
              {renderSchema(schema, [...path, key])}
            </React.Fragment>
          ) : (
            <React.Fragment>
              <label>{key}</label>
              {renderSchema(schema, [...path, key])}
            </React.Fragment>
          )}
        </div>
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
            <Fieldset variant="unstyled" key={i}>
              {renderSchema(items, [...path, i], {
                ...options,
                icon: (
                  <ActionIcon
                    variant="default"
                    onClick={() => {
                      const updated = values.filter((value, j) => {
                        return j !== i;
                      });
                      set(req, path, updated);
                      setReq({ ...req });
                    }}>
                    <PiTrashBold />
                  </ActionIcon>
                ),
              })}
            </Fieldset>
          );
        })}
      </React.Fragment>
    );
  }

  function setField(evt, { checked, type, value, path }) {
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
      <TextInput
        {...options}
        path={path}
        value={value || ''}
        onChange={(e) => {
          setField(event, { value: e.target.value, path, ...options });
        }}
        autoComplete="chrome-off"
        spellCheck="false"
      />
    );
  }

  function renderCheckbox(path, options) {
    const value = get(req, path);
    return (
      <Switch
        toggle
        path={path}
        checked={value || false}
        onChange={(e) => {
          setField(event, { value: e.target.checked, path, ...options });
        }}
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
        <Stack>
          <ErrorMessage error={error} />
          {res && <Code language="json">{JSON.stringify(res, null, 2)}</Code>}
          {recorded && (
            <Text size="sm" fw="bold">
              Response Recorded
            </Text>
          )}
        </Stack>
      );
    }
  }

  return (
    <React.Fragment>
      {React.cloneElement(trigger, {
        onClick: open,
      })}
      <Drawer position="right" opened={opened} onClose={close} title={route}>
        <Stack>
          <LoadingOverlay visible={loading} overlayBlur={2} />

          <Tabs
            value={activeTab === 0 ? 'request' : 'response'}
            onChange={(value) => setActiveTab(value === 'request' ? 0 : 1)}>
            <Tabs.List>
              <Tabs.Tab value="request">Request</Tabs.Tab>
              <Tabs.Tab value="response">Response</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel mt={'md'} value="request">
              {renderRequestPane()}
            </Tabs.Panel>

            <Tabs.Panel mt={'md'} value="response">
              {renderResponsePane()}
            </Tabs.Panel>
          </Tabs>
        </Stack>
        <Affix position={{ bottom: 0, right: 0 }}>
          <Paper p="xs">
            <Group justify="flex-end" gap="md">
              {canEditDocs() && (
                <ActionIcon
                  variant="default"
                  title="Perform request and record as example"
                  onClick={onRecordClick}>
                  <PiRecordBold />
                </ActionIcon>
              )}
              <ActionIcon
                variant="default"
                disabled={loading}
                onClick={onPlayClick}
                title="Perform request">
                <PiPlayBold />
              </ActionIcon>
            </Group>
          </Paper>
        </Affix>
      </Drawer>
    </React.Fragment>
  );
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

function AnyOfSchema(props) {
  const { schema, renderSchema } = props;
  const { anyOf = [] } = schema;

  const [selected, setSelected] = useState(0);

  return (
    <React.Fragment>
      <SegmentedControl
        value={selected}
        data={anyOf
          .map((schema, i) => {
            return {
              label: schema.type || '',
              value: i,
            };
          })
          .filter((item) => {
            return item.label;
          })}
        onChange={(value) => {
          setSelected(value);
        }}
      />
      {renderSchema(anyOf[selected])}
    </React.Fragment>
  );
}

function getRank(key, obj) {
  let rank = obj[key];
  if (typeof rank !== 'number') {
    rank = obj['default'];
  }
  return rank;
}
