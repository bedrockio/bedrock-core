import { get, set } from 'lodash';
import React, { useState } from 'react';

import {
  PiMinus,
  PiPlayBold,
  PiPlus,
  PiRecordBold,
  PiTrashBold,
} from 'react-icons/pi';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

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
  const [opened, setOpened] = useState(false);

  function open() {
    setOpened(true);
  }

  function close() {
    setOpened(false);
  }

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

  // By JSONSchema spec type may be an array
  function getBaseType(arg) {
    if (!Array.isArray(arg)) {
      return arg;
    }
    const types = arg;

    if (types.length === 1) {
      return types[0];
    }
    const nonNulls = types.filter((type) => {
      return type !== 'null';
    });

    if (nonNulls.length === 1) {
      return nonNulls[0];
    }
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
        <div className="flex flex-col gap-4">
          {renderParameters()}
          {renderQuery()}
          {renderBody()}
          <Separator />
          {renderOutput()}
        </div>
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
          <p className="text-sm font-bold">Body</p>
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
    const baseType = getBaseType(type);
    switch (baseType) {
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
        throw new Error(`Cannot find type ${baseType}.`);
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
                      <Button variant="outline" size="icon" onClick={toggle}>
                        {open ? <PiMinus /> : <PiPlus />}
                      </Button>
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
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const p = [...path, key];
                    const values = get(req, p, []);
                    set(req, p, [...values, undefined]);
                    setReq({ ...req });
                  }}>
                  <PiPlus />
                </Button>
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
            <div key={i}>
              {renderSchema(items, [...path, i], {
                ...options,
                icon: (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const updated = values.filter((value, j) => {
                        return j !== i;
                      });
                      set(req, path, updated);
                      setReq({ ...req });
                    }}>
                    <PiTrashBold />
                  </Button>
                ),
              })}
            </div>
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

  function renderInput(path, options = {}) {
    const { label, icon, ...rest } = options;
    const value = get(req, path);
    return (
      <div className="flex flex-col gap-1" key={path.join('.')}>
        {label && <Label>{label}</Label>}
        <div className="flex items-center gap-2">
          <Input
            {...rest}
            value={value || ''}
            onChange={(e) => {
              setField(e, { value: e.target.value, path, ...options });
            }}
            autoComplete="chrome-off"
            spellCheck="false"
          />
          {icon}
        </div>
      </div>
    );
  }

  function renderCheckbox(path, options = {}) {
    const { label, icon } = options;
    const value = get(req, path);
    return (
      <div className="flex items-center gap-2" key={path.join('.')}>
        <Switch
          checked={value || false}
          onCheckedChange={(checked) => {
            setField(null, { checked, type: 'checkbox', path, ...options });
          }}
        />
        {label && <Label>{label}</Label>}
        {icon}
      </div>
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
        <div className="flex flex-col gap-4">
          <ErrorMessage error={error} />
          {res && <Code language="json">{JSON.stringify(res, null, 2)}</Code>}
          {recorded && <p className="text-sm font-bold">Response Recorded</p>}
        </div>
      );
    }
  }

  return (
    <React.Fragment>
      {React.cloneElement(trigger, {
        onClick: open,
      })}
      <Sheet
        open={opened}
        onOpenChange={(value) => (value ? open() : close())}>
        <SheetContent side="right" className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{route}</SheetTitle>
          </SheetHeader>
          <div className="relative flex flex-col gap-4 p-4">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60">
                <Spinner />
              </div>
            )}

            <Tabs
              value={activeTab === 0 ? 'request' : 'response'}
              onValueChange={(value) =>
                setActiveTab(value === 'request' ? 0 : 1)
              }>
              <TabsList>
                <TabsTrigger value="request">Request</TabsTrigger>
                <TabsTrigger value="response">Response</TabsTrigger>
              </TabsList>

              <TabsContent value="request" className="mt-4">
                {renderRequestPane()}
              </TabsContent>

              <TabsContent value="response" className="mt-4">
                {renderResponsePane()}
              </TabsContent>
            </Tabs>
          </div>
          <div className="absolute right-0 bottom-0 flex justify-end gap-4 p-2">
            {canEditDocs() && (
              <Button
                variant="outline"
                size="icon"
                title="Perform request and record as example"
                onClick={onRecordClick}>
                <PiRecordBold />
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              disabled={loading}
              onClick={onPlayClick}
              title="Perform request">
              <PiPlayBold />
            </Button>
          </div>
        </SheetContent>
      </Sheet>
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

  const items = anyOf
    .map((schema, i) => {
      return {
        label: schema.type || '',
        value: i,
      };
    })
    .filter((item) => {
      return item.label;
    });

  return (
    <React.Fragment>
      <div className="inline-flex gap-1 rounded-md border p-1">
        {items.map((item) => {
          return (
            <Button
              key={item.value}
              type="button"
              size="sm"
              variant={selected === item.value ? 'default' : 'ghost'}
              className={cn(selected !== item.value && 'text-muted-foreground')}
              onClick={() => setSelected(item.value)}>
              {item.label}
            </Button>
          );
        })}
      </div>
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
