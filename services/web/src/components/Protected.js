import { useSession } from 'stores/session';

import { userHasAccess } from 'utils/permissions';

export default function Protected(props) {
  const { children, ...rest } = props;

  const { user } = useSession();
  const hasAccess = userHasAccess(user, rest);

  if (hasAccess) {
    return children;
  } else {
    return null;
  }
}
