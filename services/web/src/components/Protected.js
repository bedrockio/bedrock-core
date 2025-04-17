import { useSession } from 'stores/session';

export default function Protected({ permission, scope, children, scopeRef }) {
  const { hasAccess } = useSession();

  if (
    hasAccess({
      permission,
      scope,
      scopeRef,
    })
  ) {
    return children;
  } else {
    return null;
  }
}
