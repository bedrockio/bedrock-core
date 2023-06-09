import React from 'react';
import { get } from 'lodash';
import { Link } from 'react-router-dom';

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
    return <h4>Authentication: {this.renderAuth()}</h4>;
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
