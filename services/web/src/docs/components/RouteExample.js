import { useState } from 'react';

import { useClass } from 'helpers/bem';

import { ActionIcon, Code, Text, Stack, Group } from '@mantine/core';
import { JumpLink } from 'components/Link';
import { expandRef } from 'docs/utils';

import ConfirmModal from 'components/ConfirmModal';
import { modals } from '@mantine/modals';

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

  function openDeleteExample() {
    modals.open({
      title: `Delete Example`,
      children: (
        <ConfirmModal
          negative
          confirmButton="Delete"
          onConfirm={async () => {
            unsetPath(path);
          }}
          content={<Text>Are you sure you want to delete this example?</Text>}
        />
      ),
    });
  }

  return (
    <div className={className}>
      <Stack>
        <div
          className={getElementClass('title', isGood() ? 'good' : 'bad')}
          onClick={onToggleClick}>
          <Group justify="space-between">
            <Group grow>
              <Text
                style={{
                  margin: 0,
                }}>
                {status}
              </Text>
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
                  <ActionIcon variant="default">
                    <IconTrash size={14} />
                  </ActionIcon>
                }
              />
            </Group>
            <Group>
              {canEditDocs() && (
                <ActionIcon
                  variant="default"
                  onClick={(evt) => {
                    evt.stopPropagation();
                    openDeleteExample();
                  }}>
                  <IconTrash size={14} />
                </ActionIcon>
              )}
              {open ? <IconMinus size={14} /> : <IconPlus size={14} />}
            </Group>
          </Group>
        </div>
        {open && (
          <div className={getElementClass('content')}>
            {renderRequestPath(requestPath)}
            {renderSchema(schema)}
            {renderBody('Request Body:', requestBody)}
            {renderBody('Response Body:', responseBody)}
          </div>
        )}
      </Stack>
    </div>
  );
}
