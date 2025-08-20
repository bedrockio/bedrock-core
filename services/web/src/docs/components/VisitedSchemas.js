import React from 'react';

import { Divider } from '@mantine/core';

import { expandRef } from 'docs/utils';

import { DocsContext } from '../utils/context';

import EditableField from './EditableField';
import Properties from './Properties';

export default class VisitedSchemas extends React.Component {
  static contextType = DocsContext;

  render() {
    const { visitedComponents } = this.context;
    if (visitedComponents) {
      const schemas = Array.from(visitedComponents);
      schemas.sort((a, b) => {
        const aName = expandRef(a).name;
        const bName = expandRef(b).name;
        return aName.localeCompare(bName);
      });
      return (
        <React.Fragment>
          {schemas.map((ref, i) => {
            const { name, path } = expandRef(ref);
            return (
              <React.Fragment key={name}>
                {i > 0 && <Divider my="sm" />}

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
