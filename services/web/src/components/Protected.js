import { useSession } from 'stores/session';

/**
 * A component that conditionally renders its children based on user permissions.
 *
 * @component
 * @param {Object} props - The component props
 * @param {string} props.permission - The permission name required to view the content
 * @param {string} props.endpoint - The API endpoint associated with the permission
 * @param {string} [props.scope] - The scope name for the permission
 * @param {React.ReactNode} props.children - The content to be rendered if the user has access
 * @param {string|number} [props.scopeRef] - A reference ID for the specific scope instance
 * @returns {React.ReactNode|null} The children if the user has access, otherwise null
 */
export default function Protected({
  permission,
  endpoint,
  scope,
  children,
  scopeRef,
}) {
  const { hasAccess } = useSession();

  if (
    hasAccess({
      endpoint,
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
