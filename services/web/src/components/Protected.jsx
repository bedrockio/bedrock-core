import React from 'react';
import { withSession } from 'stores';
import { userHasAccess } from 'utils/permissions';

class Protected extends React.Component {
  render() {
    const { user } = this.context;
    const { endpoint, permission = 'read', scope = 'global' } = this.props;
    const hasAccess =
      user && userHasAccess(user, { endpoint, permission, scope });
    return <React.Fragment>{hasAccess && this.props.children}</React.Fragment>;
  }
}

export default withSession(Protected);
