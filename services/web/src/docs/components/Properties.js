import { Popover } from '@mantine/core';
import { get, isEqual } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import { useClass } from 'helpers/bem';

import { JumpLink } from 'components/Link';

import { expandRef } from '../utils';
import EditableField from './EditableField';
import './properties.less';
import { useDocs } from '../utils/context';

const OBJECT_ID_REF = '#/components/schemas/ObjectId';

export default function DocsProperties(props) {
  const { path, model, getPath, hideFields = [], additionalSort } = props;

  const { className, getElementClass } = useClass('docs-properties');
  // static contextType = DocsContext;
  //
  const { docs, loading, visitedComponents } = useDocs();

  function getModelPath(name) {
    if (model) {
      return ['components', 'schemas', model, 'properties', name];
    }
  }

  function isArrayVariant(oneOf) {
    if (oneOf.length === 2) {
      const { $ref: ref1, enum: enum1 } = oneOf[0];
      const { $ref: ref2, enum: enum2 } = oneOf[1].items || {};
      if (ref1 === ref2) {
        return true;
      } else if (enum1 && enum2) {
        return isEqual(enum1, enum2);
      }
    }
  }

  function isRangeVariant(oneOf) {
    if (oneOf.length === 3) {
      if (isArrayVariant(oneOf.slice(0, 2))) {
        const { $ref = '' } = oneOf[2];
        return $ref.endsWith('Range');
      }
    }
  }

  function render() {
    if (!docs) {
      return null;
    }

    const data = props.data || get(docs, path);

    if (loading || !data) {
      return null;
    }

    return <div className={className}>{renderParams(data, path)}</div>;
  }

  function renderParams(data, path, options = {}) {
    const { level = 0 } = options;
    let entries = Object.entries(data);
    entries.sort((a, b) => {
      const aRequired = a[1].required || false;
      const bRequired = b[1].required || false;

      if (aRequired !== bRequired) {
        return bRequired - aRequired;
      } else if (additionalSort) {
        return additionalSort(a, b, level);
      } else {
        return 0;
      }
    });

    return entries
      .filter(([name]) => {
        return !hideFields.includes(name);
      })
      .map(([name, desc]) => {
        if (desc.properties) {
          return (
            <React.Fragment key={name}>
              {renderParam(name, desc, path, {
                ...options,
                level,
              })}
              <div className={getElementClass('param-group')}>
                {renderParams(desc.properties, [...path, name], {
                  ...options,
                  level: level + 1,
                })}
              </div>
            </React.Fragment>
          );
        } else if (desc.items?.properties) {
          return (
            <React.Fragment key={name}>
              {renderParam(name, desc, path, {
                ...options,
                level,
              })}
              <div className={getElementClass('param-group')}>
                {renderParams(desc.items.properties, [...path, name], {
                  ...options,
                  level: level + 1,
                })}
              </div>
            </React.Fragment>
          );
        } else {
          return renderParam(name, desc, path, {
            ...options,
            level,
          });
        }
      });
  }

  function renderParam(name, desc, path, options) {
    const { level } = options;
    const { description, required, default: defaultValue } = desc;
    return (
      <div
        key={name}
        style={{
          '--level': level,
        }}
        className={getElementClass('param')}>
        <div className={getElementClass('name')}>
          <code>{name}</code>
        </div>
        <div className={getElementClass('description')}>
          <div className={getElementClass('types')}>{renderType(desc)}</div>

          {required && (
            <div className={getElementClass('required')}>Required</div>
          )}
          {description && <div className={getElementClass('divider')} />}

          <EditableField
            type="description"
            model={model}
            path={path ? [...path, name] : getPath(name)}
            modelPath={getModelPath(name)}
          />

          {defaultValue !== undefined && (
            <div className={getElementClass('divider')} />
          )}
          {renderDefault(defaultValue)}
        </div>
      </div>
    );
  }

  function renderType(desc, isArray = false) {
    const { type, $ref, oneOf, format, enum: allowed } = desc;
    if (oneOf) {
      if (isArrayVariant(oneOf)) {
        if (props.query) {
          return (
            <React.Fragment>
              {renderType(oneOf[0])}
              <span
                title="May pass multiple parameters in query."
                className={getElementClass('note')}>
                *
              </span>
            </React.Fragment>
          );
        } else {
          return (
            <React.Fragment>
              {renderType(oneOf[0])}
              <Popover position="right" withArrow>
                <Popover.Target>
                  <span className={getElementClass('note')}>*</span>
                </Popover.Target>
                <Popover.Dropdown>May also be an array.</Popover.Dropdown>
              </Popover>
            </React.Fragment>
          );
        }
      } else if (isRangeVariant(oneOf)) {
        visitedComponents.add(oneOf[2].$ref);
        return (
          <React.Fragment>
            {renderType(oneOf[0])}
            <span
              title="May also be an array or range (see below)."
              className={getElementClass('note')}>
              *
            </span>
          </React.Fragment>
        );
      } else {
        return oneOf.map((entry, i) => {
          const comma = i > 0 ? ', ' : '';
          return (
            <React.Fragment key={i}>
              {comma}
              {renderType(entry)}
            </React.Fragment>
          );
        });
      }
    } else if (type === 'array') {
      return renderType(desc.items, '[]');
    } else if ($ref) {
      visitedComponents.add($ref);
      const { name } = expandRef($ref);
      return <JumpLink to={name}>{isArray ? `[${name}]` : name}</JumpLink>;
    } else if (allowed) {
      if (isArray) {
        return (
          <code>
            [
            {allowed
              .map((val) => {
                return JSON.stringify(val);
              })
              .join(' | ')}
            ]
          </code>
        );
      } else {
        return allowed.map((val, i) => {
          return (
            <React.Fragment key={val}>
              {i > 0 && ', '}
              <code>{JSON.stringify(val)}</code>
            </React.Fragment>
          );
        });
      }
    } else if (format === 'mongo-object-id') {
      visitedComponents.add(OBJECT_ID_REF);
      const { name } = expandRef(OBJECT_ID_REF);
      return <JumpLink to={name}>{isArray ? `[${name}]` : name}</JumpLink>;
    } else if (type) {
      return <span>{isArray ? `[${type}]` : type}</span>;
    } else {
      return <span>any</span>;
    }
  }

  function renderDefault(defaultValue) {
    if (defaultValue && typeof defaultValue === 'object') {
      return (
        <div className={getElementClass('default')}>
          <div className={getElementClass('default-title')}>Default:</div>
          <pre>
            <code>{JSON.stringify(defaultValue, null, 2)}</code>
          </pre>
        </div>
      );
    } else if (defaultValue !== undefined) {
      return (
        <div className={getElementClass('default')}>
          <span className={getElementClass('default-title')}>Default:</span>{' '}
          <code>{JSON.stringify(defaultValue, null, 2)}</code>
        </div>
      );
    }
  }

  return render();
}

DocsProperties.propTypes = {
  required: PropTypes.bool,
  path: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  hideFields: PropTypes.arrayOf(PropTypes.string),
  additionalSort: PropTypes.func,
};
