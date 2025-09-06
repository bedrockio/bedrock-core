import { ActionIcon, Code, Group, Stack, Text } from '@mantine/core';
import { useState } from 'react';
import { PiMinus, PiPlus, PiTrashFill } from 'react-icons/pi';

import { useClass } from 'helpers/bem';

import { JumpLink } from 'components/Link';
import ModalWrapper from 'components/ModalWrapper';
import ConfirmModal from 'components/modals/Confirm';
import { expandRef } from 'docs/utils';

import EditableField from './EditableField';
import './route-example.less';
import { useDocs } from '../utils/context';

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
                    <PiTrashFill />
                  </ActionIcon>
                }
              />
            </Group>
            <Group>
              {canEditDocs() && (
                <ModalWrapper
                  title="Delete Example"
                  component={
                    <ConfirmModal
                      negative
                      confirmButton="Delete"
                      onConfirm={async () => {
                        unsetPath(path);
                      }}
                      content={
                        <Text>
                          Are you sure you want to delete this example?
                        </Text>
                      }
                    />
                  }
                  trigger={
                    <ActionIcon
                      variant="default"
                      onClick={(evt) => {
                        evt.stopPropagation();
                      }}>
                      <PiTrashFill />
                    </ActionIcon>
                  }
                />
              )}
              {open ? <PiMinus /> : <PiPlus />}
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
