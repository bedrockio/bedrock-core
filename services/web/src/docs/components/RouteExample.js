import React, { useState } from 'react';

import { useClass } from 'helpers/bem';

import { ActionIcon, Code } from '@mantine/core';
import { JumpLink } from 'components/Link';
import { expandRef } from 'docs/utils';
import Confirm from 'components/Confirm';
import Layout from 'components/Layout';

import { useDocs } from '../utils/context';

import EditableField from './EditableField';

import './route-example.less';
import { IconMinus, IconPlus, IconTrash } from '@tabler/icons-react';

export default function RouteExample(props) {
  const { path, status, schema, requestPath, requestBody, responseBody } =
    props;

  const { mode, unsetPath, canEditDocs } = useDocs();

  const { className, getElementClass } = useClass('route-example');

  const [open, setOpen] = useState(false);

  function isGood() {
    return status >= 200 && status <= 300;
  }

  function onToggleClick() {
    setOpen(!open);
  }

  function onDeleteConfirm() {
    unsetPath(path);
  }

  function render() {
    return (
      <div className={className}>
        <Layout
          horizontal
          center
          spread
          className={getElementClass('title', isGood() ? 'good' : 'bad')}
          onClick={onToggleClick}>
          <Layout.Group>{status}</Layout.Group>
          <Layout.Group grow>
            <EditableField
              type="summary"
              path={path}
              onClick={(evt) => {
                if (mode === 'edit') {
                  evt.stopPropagation();
                }
              }}
              className={getElementClass('summary')}
              trigger={
                <ActionIcon variant="transparent">
                  <IconTrash size={14} />
                </ActionIcon>
              }
            />
          </Layout.Group>
          <Layout.Group>
            {canEditDocs() && (
              <React.Fragment>
                <Confirm
                  negative
                  size="small"
                  confirmButton="Delete"
                  header="Delete this example?"
                  trigger={
                    <ActionIcon
                      onClick={(evt) => {
                        evt.stopPropagation();
                      }}>
                      <IconTrash size={14} />
                    </ActionIcon>
                  }
                  onConfirm={onDeleteConfirm}
                />
              </React.Fragment>
            )}
            {open ? <IconMinus size={14} /> : <IconPlus size={14} />}
          </Layout.Group>
        </Layout>
        {open && (
          <div className={getElementClass('content')}>
            {renderRequestPath(requestPath)}
            {renderSchema(schema)}
            {renderBody('Request Body:', requestBody)}
            {renderBody('Response Body:', responseBody)}
          </div>
        )}
      </div>
    );
  }

  function renderRequestPath(path) {
    if (path) {
      return (
        <div className={getElementClass('request-path')}>
          <div className={getElementClass('header')}>Path:</div>
          <Code>{path}</Code>
        </div>
      );
    }
  }

  function renderSchema(schema) {
    if (schema?.$ref) {
      const { name } = expandRef(schema.$ref);
      return (
        <div className={getElementClass('schema')}>
          <div className={getElementClass('header')}>
            Returns: <JumpLink to={name}>{name}</JumpLink>
          </div>{' '}
        </div>
      );
    }
  }

  function renderBody(title, body) {
    if (typeof body === 'object') {
      body = JSON.stringify(body, null, 2);
    }
    if (body) {
      return (
        <div className={getElementClass('body')}>
          <div className={getElementClass('header')}>{title}</div>
          <Code language="json">{body}</Code>
        </div>
      );
    }
  }

  return render();
}
