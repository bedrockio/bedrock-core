// Note, you probably don't need this for simple authentication.
// Instead, having different app boundaries for authenticated vs
// unauthenticated makes things simpler to just use <Route>.

import { Redirect } from '@bedrockio/router';

import { useSession } from 'stores/session';

import { userHasAccess } from 'utils/permissions';

export default function ProtectedRoute(props) {
  const { endpoint, permission, scope } = props;

  const { user } = useSession();
  const hasAccess = userHasAccess(user, {
    scope,
    endpoint,
    permission,
  });

  if (!hasAccess) {
    return <Redirect to="/" />;
  }

  return props.children;
}
