import React from 'react';
import { get, startCase } from 'lodash';

import { getRoutePath } from 'docs/utils';

import { DocsContext } from '../utils/context';

export default class Route extends React.Component {
  static contextType = DocsContext;

  render() {
    const { docs } = this.context;
    const { route } = this.props;
    const permissions = get(docs, [...getRoutePath(route), 'x-permissions']);
    if (!permissions) {
      return null;
    }
    const { endpoint, permission } = permissions;
    return (
      <div style={{ marginTop: '1em' }}>
        <b>Permissions</b>: {startCase(`${endpoint} ${permission}`)}
      </div>
    );
  }
}
