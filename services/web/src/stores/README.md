# Stores

Components can inject a session store, allowing them to access and react to
changes in the user object and stored session data. These are implemented as a
single [React context](https://reactjs.org/docs/context.html).

- [Hooks](#hooks)
- [State](#state)
- [Methods](#methods)

## Hooks

Hooks allow access to the session store via the `useSession` hook.

```jsx
import { useSession } from 'stores/session';

export default function MyComponent() {
  const { user, loading } = useSession();

  if (user) {
    return <div>Hello {user.name}.</div>;
  } else {
    return 'Loading...';
  }
}
```

## State

State exposed on the session context:

- `user` - An `Object` representing the user when loaded. Null when no
  authentication token is set.
- `loading` - `true` when the session is loading. This happens once on bootstrap
  or when `load` is explicitly called.
- `error` - An `Error` object when the session errored.
- `stored` - An `Object` holding the locally stored data.

## Methods

- `load()` - Reloads the session data.
- `updateUser(data)` - Updates the user with `data`.
- `setStored(key, value)` - Adds session data. `key` must be a `string` and
  `value` must be serializable. Data is stored using `localStorage`.
- `removeStored(key)` - Removes stored data. `key` must be a `string`.
- `clearStored()` - Clears all stored data.
- `isAdmin()` - Checks if the user has the `admin` role.
- `hasRole(role)` - Checks if the user has a specific role. `role` must be a
  `string`.
- `hasRoles(roles)` - Checks if the user has any `roles`. `roles` must be an
  `Array` of type `string`.
- `authenticate(token)` - Authenticates the user. `token` must be a JWT token as
  a `string`. Returns a path to redirect.
- `logout()` - Logs the user out. Returns a path to redirect.
