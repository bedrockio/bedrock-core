# Stores

Components can inject a session store, allowing them to access and react to changes in the user object and stored session data. These are implemented as a single [React context](https://reactjs.org/docs/context.html).

- [Class Components](#class-components)
- [Hooks](#hooks)
- [State](#state)
- [Methods](#methods)

## Class Components

Class based components can be injected with the session store using the HOC `withSession` or `withLoadedSession`. These are identical with the exception that `withLoadedSession` does not mount the component until the user object has been loaded, ensuring that it is available when `componentDidMount` is called.

Components are re-rendered when the session changes, most notably when the app bootstraps and first attempts to load the user in the case of `withSession`. For most cases, prefer `withSession` when the component can be displayed before access to the user object. This allows for a more responsive app that does not display an empty shell while the user is loading.

When an update occurs due to a change to the session, the last session state will be passed to `componentDidUpdate` in the same manner as `lastProps` and `lastState`. This uses [getSnapshotBeforeUpdate](https://reactjs.org/docs/react-component.html#getsnapshotbeforeupdate) under the hood. In addition to the `user` object a boolean `loading` is exposed to react to the user loading state.

```jsx
import { withSession } from 'stores';

class MyComponent extends React.Component {
  componentDidMount() {
    const { user, loading } = this.context;
    console.log(user); // null
    console.log(loading); // true
  }

  componentDidUpdate(lastProps, lastState, lastContext) {
    const { user, loading } = this.context;
    const { user: lastUser, loading: lastLoading } = lastContext;
    console.log(user); // User object when logged in
    console.log(loading); // false
    console.log(lastUser); // null
    console.log(lastLoading); // true
  }

  render() {
    const { user } = this.context;
    if (user) {
      return <div>Hello {user.name}.</div>;
    } else {
      return 'Loading...';
    }
  }
}

export default withSession(MyComponent);
```

```jsx
import { withLoadedSession } from 'stores';

class MyComponent extends React.Component {
  // Using withLoadedSession lets you immediately take
  // action with the user object on component mount
  componentDidMount() {
    const { user, loading } = this.context;
    console.log(user); // User object when logged in
    console.log(loading); // false
  }

  render() {
    const { user } = this.context;
    return <div>Hello {user.name}.</div>;
  }
}

export default withLoadedSession(MyComponent);
```

```jsx
import { withSession } from 'stores';

// Using the decorator pattern
@withSession
class MyComponent extends React.Component {}
```

## Hooks

Hooks allow access to the session store via the `useSession` hook.

```jsx
import { useSession } from 'stores';

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

- `user` - An `Object` representing the user when loaded. Null when no authentication token is set.
- `loading` - `true` when the session is loading. This happens once on bootstrap or when `loadUser` is explicitly called.
- `error` - An `Error` object when the session errored.
- `stored` - An `Object` holding the locally stored data.

## Methods

- `loadUser()` - Reloads the user.
- `updateUser(data)` - Updates the user with `data`.
- `addStored(key, value)` - Adds session data. `key` must be a `string` and `value` must be serializable. Data is stored using `localStorage`.
- `removeStored(key)` - Removes stored data. `key` must be a `string`.
- `clearStored()` - Clears all stored data.
- `isAdmin()` - Checks if the user has the `admin` role.
- `hasRole(role)` - Checks if the user has a specific role. `role` must be a `string`.
- `hasRoles(roles)` - Checks if the user has any `roles`. `roles` must be an `Array` of type `string`.
- `setToken(token)` - Sets the authentication token. `token` must be a `string`.
