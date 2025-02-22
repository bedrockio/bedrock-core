# Stores

Components can inject a session store, allowing them to access and react to
changes in the user object and stored session data. These are implemented as a
single [React context](https://reactjs.org/docs/context.html).

- [Class Components](#class-components)
- [Hooks](#hooks)
- [State](#state)
- [Methods](#methods)

## Class Components

Class based components can be injected with the session store using the HOC
`withSession`, and accessed with `this.context`.

Bedrock by default shows a loader while the session is bootstrapping. This means
that you can use `withSession` and depend on the `user` object to exist when the
wrapped component is mounted if the user is logged in. In most cases this is
acceptable, however if the app needs to be more responsive (ie. display non-user
specific content while bootstrapping), it can be removed (see
[App.js](../App.js)) which will allow the wrapped component to render before the
session is loaded. For most cases, `withSession` can still be used as the
wrapped component will re-render when the session is loaded. For the less common
case when components need to load data on `componentDidMount` another HOC
`withLoadedSession` is provided. This will wait to mount the wrapped component
until the session has been bootstrapped.

```jsx
import { withSession } from 'contexts/session';

class MyComponent extends React.Component {
  componentDidMount() {
    const { user, loading } = this.context;
    console.log(user);
    console.log(loading);
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
import { withLoadedSession } from 'contexts/session';

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
import { withSession } from 'contexts/session';

// Using the decorator pattern
@withSession
class MyComponent extends React.Component {}
```

## Hooks

Hooks allow access to the session store via the `useSession` hook.

```jsx
import { useSession } from 'contexts/session';

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
