import React from 'react';
import PropTypes from 'prop-types';
import { get, isEqual } from 'lodash';

import bem from 'helpers/bem';

import { JumpLink } from 'components/Link';

import { expandRef } from '../utils';
import { DocsContext } from '../utils/context';
import EditableField from './EditableField';

import './properties.less';

const OBJECT_ID_REF = '#/components/schemas/ObjectId';

@bem
export default class DocsProperties extends React.Component {
  static contextType = DocsContext;

  getModelPath(name) {
    const { model } = this.props;
    if (model) {
      return ['components', 'schemas', model, 'properties', name];
    }
  }

  isArrayVariant(oneOf) {
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

  isRangeVariant(oneOf) {
    if (oneOf.length === 3) {
      if (this.isArrayVariant(oneOf.slice(0, 2))) {
        const { $ref = '' } = oneOf[2];
        return $ref.endsWith('Range');
      }
    }
  }

  render() {
    const { docs, loading } = this.context;
    const { path } = this.props;
    if (!docs) {
      return null;
    }

    const data = this.props.data || get(docs, path);

    if (loading || !data) {
      return null;
    }

    return (
      <div className={this.getBlockClass()}>
        {this.renderParams(data, path)}
      </div>
    );
  }

  renderParams(data, path, options = {}) {
    const { additionalSort, hideFields } = this.props;
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
              {this.renderParam(name, desc, path, {
                ...options,
                level,
              })}
              <div className={this.getElementClass('param-group')}>
                {this.renderParams(desc.properties, [...path, name], {
                  ...options,
                  level: level + 1,
                })}
              </div>
            </React.Fragment>
          );
        } else {
          return this.renderParam(name, desc, path, {
            ...options,
            level,
          });
        }
      });
  }

  renderParam(name, desc, path, options) {
    const { level } = options;
    const { model, getPath } = this.props;
    const { description, required, default: defaultValue } = desc;
    return (
      <div
        key={name}
        style={{
          '--level': level,
        }}
        className={this.getElementClass('param')}>
        <div className={this.getElementClass('name')}>
          <code>{name}</code>
        </div>
        <div className={this.getElementClass('description')}>
          <div className={this.getElementClass('types')}>
            {this.renderType(desc)}
          </div>

          {required && (
            <div className={this.getElementClass('required')}>Required</div>
          )}
          {description && <div className={this.getElementClass('divider')} />}

          <EditableField
            type="description"
            model={model}
            path={path ? [...path, name] : getPath(name)}
            modelPath={this.getModelPath(name)}
          />

          {defaultValue !== undefined && (
            <div className={this.getElementClass('divider')} />
          )}
          {this.renderDefault(defaultValue)}
        </div>
      </div>
    );
  }

  renderType(desc, isArray = false) {
    const { type, $ref, oneOf, format, enum: allowed } = desc;
    if (oneOf) {
      if (this.isArrayVariant(oneOf)) {
        if (this.props.query) {
          return (
            <React.Fragment>
              {this.renderType(oneOf[0])}
              <span
                title="May pass multiple parameters in query."
                className={this.getElementClass('note')}>
                *
              </span>
            </React.Fragment>
          );
        } else {
          return (
            <React.Fragment>
              {this.renderType(oneOf[0])}
              <span
                title="May also be an array."
                className={this.getElementClass('note')}>
                *
              </span>
            </React.Fragment>
          );
        }
      } else if (this.isRangeVariant(oneOf)) {
        this.context.visitedComponents.add(oneOf[2].$ref);
        return (
          <React.Fragment>
            {this.renderType(oneOf[0])}
            <span
              title="May also be an array or range (see below)."
              className={this.getElementClass('note')}>
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
              {this.renderType(entry)}
            </React.Fragment>
          );
        });
      }
    } else if (type === 'array') {
      return this.renderType(desc.items, '[]');
    } else if ($ref) {
      this.context.visitedComponents.add($ref);
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
      this.context.visitedComponents.add(OBJECT_ID_REF);
      const { name } = expandRef(OBJECT_ID_REF);
      return <JumpLink to={name}>{isArray ? `[${name}]` : name}</JumpLink>;
    } else if (type) {
      return <span>{isArray ? `[${type}]` : type}</span>;
    } else {
      return <span>any</span>;
    }
  }

  renderDefault(defaultValue) {
    if (defaultValue && typeof defaultValue === 'object') {
      return (
        <div className={this.getElementClass('default')}>
          <div className={this.getElementClass('default-title')}>Default:</div>
          <pre>
            <code>{JSON.stringify(defaultValue, null, 2)}</code>
          </pre>
        </div>
      );
    } else if (defaultValue !== undefined) {
      return (
        <div className={this.getElementClass('default')}>
          <span className={this.getElementClass('default-title')}>
            Default:
          </span>{' '}
          <code>{JSON.stringify(defaultValue, null, 2)}</code>
        </div>
      );
    }
  }
}

DocsProperties.propTypes = {
  required: PropTypes.bool,
  path: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  hideFields: PropTypes.arrayOf(PropTypes.string),
  additionalSort: PropTypes.func,
};

DocsProperties.defaultProps = {
  hideFields: [],
  required: false,
};
