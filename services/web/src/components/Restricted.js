import { useContext } from 'react';
import { useSession } from 'stores/session';

export default function Restricted({ endpoint, permission, scope, children }) {
  const { hasAccess } = useSession();

  if (!hasAccess(endpoint, permission, scope)) {
    return null;
  }

  return children;
}
