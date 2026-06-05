import { useState } from 'react';
import { PiMinus, PiPlus, PiTrashBold } from 'react-icons/pi';

import { Button } from '@/components/ui/button';

import { useClass } from 'helpers/bem';

import { JumpLink } from 'components/Link';
import { expandRef } from 'docs/utils';
import Confirm from 'modals/Confirm';

import EditableField from './EditableField';
import './route-example.less';
import { useDocs } from '../utils/context';

export default function RouteExample(props) {
  const { route, path, status, schema, requestBody, responseBody } = props;

  const { mode, unsetPath, canEditDocs } = useDocs();

  const { className, getElementClass } = useClass('route-example');

  const [open, setOpen] = useState(false);

  function isGood() {
    return status >= 200 && status <= 300;
  }

  function onToggleClick() {
    setOpen(!open);
  }

  function renderFullRoute() {
    return (
      <div className={getElementClass('route')}>
        <div className={getElementClass('header')}>Route:</div>
        <pre className={getElementClass('route-body')}>{route}</pre>
      </div>
    );
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
          <pre className={getElementClass('content')}>{body}</pre>
        </div>
      );
    }
  }

  return (
    <div className={className}>
      <div
        className={getElementClass('title', isGood() ? 'good' : 'bad')}
        onClick={onToggleClick}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex grow items-center gap-3">
            <span className="m-0">{status}</span>
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
                <Button variant="outline" size="icon">
                  <PiTrashBold />
                </Button>
              }
            />
          </div>
          <div className="flex items-center gap-3">
            {canEditDocs() && (
              <Confirm
                title="Delete Example"
                negative
                confirmButton="Delete"
                onConfirm={async () => {
                  unsetPath(path);
                }}
                content={
                  <p>Are you sure you want to delete this example?</p>
                }
                trigger={
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={(evt) => {
                      evt.stopPropagation();
                    }}>
                    <PiTrashBold />
                  </Button>
                }
              />
            )}
            {open ? <PiMinus /> : <PiPlus />}
          </div>
        </div>
      </div>
      {open && (
        <div className={getElementClass('content')}>
          {renderFullRoute()}
          {renderSchema(schema)}
          {renderBody('Request Body:', requestBody)}
          {renderBody('Response Body:', responseBody)}
        </div>
      )}
    </div>
  );
}
