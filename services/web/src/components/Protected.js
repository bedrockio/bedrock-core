import React from 'react';

import { withSession } from 'stores';

import { userHasAccess } from 'utils/permissions';

@withSession
export default class Protected extends React.Component {
  render() {
    const { user } = this.context;
    const {
      children,
      endpoint,
      permission = 'read',
      scope = 'global',
    } = this.props;

    const hasAccess = userHasAccess(user, {
      endpoint,
      permission,
      scope,
    });

    if (hasAccess) {
      return children;
    } else {
      return null;
    }
  }
}
