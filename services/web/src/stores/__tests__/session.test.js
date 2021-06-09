import React from 'react';
import {
  SessionProvider,
  withSession,
  withLoadedSession,
  useSession,
} from '../session';
import { setToken, clearToken } from 'utils/api';
import { render, waitFor } from '@testing-library/react';

jest.mock('utils/api');
jest.mock('utils/env');

let snapshot;

beforeEach(() => {
  snapshot = null;
});

afterEach(() => {
  clearToken();
});

class MyComponent extends React.Component {
  componentDidUpdate(lastProps, lastState, lastContext) {
    snapshot = lastContext;
  }

  render() {
    const { loading, user } = this.context;
    if (loading) {
      return null;
    }
    return <div>{user?.name || 'Anonymous'}</div>;
  }
}

describe('withSession', () => {
  const Component = withSession(MyComponent);

  it('should be anonymous when logged out', async () => {
    const { container } = await render(
      <SessionProvider>
        <Component />
      </SessionProvider>
    );
    waitFor(() => {
    expect(container.textContent).toBe('Anonymous');
    });
  });

  it('should display user name', async () => {
    setToken('fake');
    const { container } = await render(
      <SessionProvider>
        <Component />
      </SessionProvider>
    );
    waitFor(() => {
    expect(container.textContent).toBe('Bob');
    });
  });

  it('should set the last context as a snapshot', async () => {
    setToken('fake');
    await render(
      <SessionProvider>
        <Component />
      </SessionProvider>
    );
    waitFor(() => {
    expect(snapshot.user).toBe(null);
    expect(snapshot.loading).toBe(true);
    });
  });
});

describe('withLoadedSession', () => {
  const Component = withLoadedSession(MyComponent);

  it('should be anonymous when logged out', async () => {
    const { container } = await render(
      <SessionProvider>
        <Component />
      </SessionProvider>
    );
    waitFor(() => {
    expect(container.textContent).toBe('Anonymous');
    });
  });

  it('should display user name', async () => {
    setToken('fake');
    const { container } = await render(
      <SessionProvider>
        <Component />
      </SessionProvider>
    );
    waitFor(() => {
      expect(container.textContent).toBe('Bob');
    });
  });
});

describe('useSession', () => {
  const Component = () => {
    const { user } = useSession();
    return <div>{user?.name || 'Anonymous'}</div>;
  };

  it('should be anonymous when logged out', async () => {
    const { container } = await render(
      <SessionProvider>
        <Component />
      </SessionProvider>
    );
    waitFor(() => {
    expect(container.textContent).toBe('Anonymous');
    });
  });

  it('should display user name', async () => {
    setToken('fake');
    const { container } = await render(
      <SessionProvider>
        <Component />
      </SessionProvider>
    );
    waitFor(() => {
      expect(container.textContent).toBe('Bob');
    });
  });
});
