import { userHasAccess } from 'utils/permissions';
import { useSession } from 'contexts/session';

export default function Protected({
  children,
  endpoint,
  permission = 'read',
  scope = 'global',
}) {
  const { user } = useSession();

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
