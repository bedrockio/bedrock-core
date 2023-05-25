import React from 'react';
import { get } from 'lodash';

import { Divider } from 'semantic';

import { expandRef } from 'docs/utils';

import { DocsContext } from '../utils/context';

import EditableField from './EditableField';
import Properties from './Properties';

export default class VisitedSchemas extends React.Component {
  static contextType = DocsContext;

  render() {
    const { visitedComponents } = this.context;
    if (visitedComponents) {
      return (
        <React.Fragment>
          {Array.from(visitedComponents).map(($ref, i) => {
            const { name, path } = expandRef($ref);
            return (
              <React.Fragment key={name}>
                {i > 0 && <Divider />}
                <div id={name}>
                  <h3>{name}</h3>
                  <EditableField type="description" path={path} />
                  <Properties path={[...path, 'properties']} />
                </div>
              </React.Fragment>
            );
          })}
        </React.Fragment>
      );
    }
  }
}
