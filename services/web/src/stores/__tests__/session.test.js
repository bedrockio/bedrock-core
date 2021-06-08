import React from 'react';
import {
  SessionProvider,
  withSession,
  withLoadedSession,
  useSession,
} from '../session';
import { setToken, clearToken } from 'utils/api';
import { render } from '@testing-library/react';

jest.mock('utils/api');
jest.mock('utils/env');

let renderCount;
let snapshot;

beforeEach(() => {
  renderCount = 0;
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
    renderCount++;
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
    expect(container.textContent).toBe('Anonymous');
    expect(renderCount).toBe(2);
  });

  it('should display user name', async () => {
    setToken('fake');
    const { container } = await render(
      <SessionProvider>
        <Component />
      </SessionProvider>
    );
    expect(container.textContent).toBe('Bob');
    expect(renderCount).toBe(2);
  });

  it('should set the last context as a snapshot', async () => {
    setToken('fake');
    await render(
      <SessionProvider>
        <Component />
      </SessionProvider>
    );
    expect(snapshot.user).toBe(null);
    expect(snapshot.loading).toBe(true);
    expect(renderCount).toBe(2);
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
    expect(container.textContent).toBe('Anonymous');
    expect(renderCount).toBe(2);
  });

  it('should display user name', async () => {
    setToken('fake');
    const { container } = await render(
      <SessionProvider>
        <Component />
      </SessionProvider>
    );
    expect(container.textContent).toBe('Bob');
    expect(renderCount).toBe(2);
  });
});

describe('useSession', () => {
  const Component = () => {
    renderCount++;
    const { user } = useSession();
    return <div>{user?.name || 'Anonymous'}</div>;
  };

  it('should be anonymous when logged out', async () => {
    const { container } = await render(
      <SessionProvider>
        <Component />
      </SessionProvider>
    );
    expect(container.textContent).toBe('Anonymous');
    expect(renderCount).toBe(2);
  });

  it('should display user name', async () => {
    setToken('fake');
    const { container } = await render(
      <SessionProvider>
        <Component />
      </SessionProvider>
    );
    expect(container.textContent).toBe('Bob');
    expect(renderCount).toBe(2);
  });
});
