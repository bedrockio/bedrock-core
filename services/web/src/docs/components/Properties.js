import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

import { Message } from 'semantic';

import { JumpLink } from 'components/Link';
import bem from 'helpers/bem';

import { expandRef } from '../utils';
import { DocsContext } from '../utils/context';
import EditableField from './EditableField';

import './properties.less';

@bem
export default class DocsProperties extends React.Component {
  static contextType = DocsContext;

  render() {
    const { docs, loading } = this.context;
    const { path } = this.props;
    if (!docs) {
      return null;
    }

    const data = get(docs, path);

    if (loading) {
      return null;
    } else if (!data) {
      return <Message error>No OpenApi entry found.</Message>;
    }
    let skipRequired = false;

    const entries = Object.entries(data);
    entries.sort((a, b) => {
      const aRequired = a[1].required || false;
      const bRequired = b[1].required || false;
      return bRequired - aRequired;
    });
    return (
      <div className={this.getBlockClass()}>
        {entries.map(([name, desc]) => {
          const { description, required, default: defaultValue } = desc;
          return (
            <div key={name} className={this.getElementClass('param')}>
              <div className={this.getElementClass('pointer')} />
              <div className={this.getElementClass('name')}>
                <code>{name}</code>
              </div>
              <div className={this.getElementClass('description')}>
                <div className={this.getElementClass('types')}>
                  {this.renderType(desc)}
                </div>

                {required && !skipRequired && (
                  <div className={this.getElementClass('required')}>
                    Required
                  </div>
                )}
                {description && (
                  <div className={this.getElementClass('divider')} />
                )}

                <EditableField
                  markdown
                  path={[...path, name]}
                  name="description"
                  value={description}
                />

                {defaultValue !== undefined && (
                  <div className={this.getElementClass('divider')} />
                )}
                {this.renderDefault(defaultValue)}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  renderType(desc, isArray = false) {
    const { type, $ref, oneOf, enum: allowed } = desc;
    if (oneOf) {
      return oneOf.map((entry, i) => {
        const comma = i > 0 ? ', ' : '';
        return (
          <React.Fragment key={i}>
            {comma}
            {this.renderType(entry)}
          </React.Fragment>
        );
      });
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
  path: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
};
