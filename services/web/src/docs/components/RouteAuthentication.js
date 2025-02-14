import React from 'react';
import { get } from 'lodash';
import { Link } from '@bedrockio/router';

import { getRoutePath } from 'docs/utils';

import { DocsContext } from '../utils/context';

export default class Route extends React.Component {
  static contextType = DocsContext;

  getAuth() {
    const { docs } = this.context;
    const { route } = this.props;
    return get(docs, [...getRoutePath(route), 'security'], []);
  }

  authRequired() {
    const auth = this.getAuth();
    if (auth.length === 0) {
      return false;
    }
    return auth.every((entry) => {
      return 'bearerAuth' in entry;
    });
  }

  authOptional() {
    const auth = this.getAuth();
    return auth.some((entry) => {
      return Object.keys(entry).length === 0;
    });
  }

  render() {
    return (
      <div style={{ marginTop: '1em' }}>
        <b>Authentication</b>: {this.renderAuth()}
      </div>
    );
  }

  renderAuth() {
    if (this.authRequired()) {
      return <Link to="/docs/getting-started#authentication">Required</Link>;
    } else if (this.authOptional()) {
      return <Link to="/docs/getting-started#authentication">Optional</Link>;
    } else {
      return 'None';
    }
  }
}
