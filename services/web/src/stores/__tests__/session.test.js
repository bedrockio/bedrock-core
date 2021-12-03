import React from 'react';
import { MemoryRouter, withRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import {
  useSession,
  withSession,
  withLoadedSession,
  SessionProvider,
} from '../session';
import screen from 'helpers/screen';
import { setToken } from 'utils/api';
import { render, waitFor } from '@testing-library/react';

jest.mock('utils/api');
jest.mock('utils/env');

afterEach(() => {
  setToken(null);
});

function wrapProviders(Component) {
  return () => {
    return (
      <MemoryRouter>
        <SessionProvider>
          <HelmetProvider>
            <Component />
          </HelmetProvider>
        </SessionProvider>
      </MemoryRouter>
    );
  };
}

function createComponent() {
  return class extends React.Component {
    render() {
      return <div>{this.context.user?.name || 'Anonymous'}</div>;
    }
  };
}

describe('hoc', () => {
  describe('withSession', () => {
    it('should be anonymous when logged out', async () => {
      const App = wrapProviders(withSession(createComponent()));
      const { container } = await render(<App />);
      await waitFor(() => {
        expect(container.textContent).toBe('Anonymous');
      });
    });

    it('should display user name when logged in', async () => {
      setToken('fake');
      const App = wrapProviders(withSession(createComponent()));
      const { container } = await render(<App />);
      await waitFor(() => {
        expect(container.textContent).toBe('Bob');
      });
    });

    describe('withRouter interop', () => {
      it('should allow withRouter first', async () => {
        setToken('fake');
        const App = wrapProviders(withSession(withRouter(createComponent())));
        const { container } = await render(<App />);
        await render(<App />);
        await waitFor(() => {
          expect(container.textContent).toBe('Bob');
        });
      });

      it('should allow withRouter last', async () => {
        setToken('fake');
        const App = wrapProviders(withRouter(withSession(createComponent())));
        const { container } = await render(<App />);
        await render(<App />);
        await waitFor(() => {
          expect(container.textContent).toBe('Bob');
        });
      });
    });

    describe('screen interop', () => {
      class MyScreen extends React.Component {
        static layout = 'null';

        render() {
          return <div>{this.context.user?.name || 'Anonymous'}</div>;
        }
      }

      afterEach(() => {
        MyScreen.contextType = null;
      });

      it('should allow screen first', async () => {
        setToken('fake');

        const App = wrapProviders(withSession(screen(MyScreen)));
        const { container } = await render(<App />);
        await render(<App />);
        await waitFor(() => {
          expect(container.textContent).toBe('Bob');
        });
      });

      it('should allow screen last', async () => {
        setToken('fake');

        const App = wrapProviders(screen(withSession(MyScreen)));
        const { container } = await render(<App />);
        await render(<App />);
        await waitFor(() => {
          expect(container.textContent).toBe('Bob');
        });
      });
    });
  });

  describe('withLoadedSession', () => {
    it('should be anonymous when logged out', async () => {
      const App = wrapProviders(withLoadedSession(createComponent()));
      const { container } = await render(<App />);
      await waitFor(() => {
        expect(container.textContent).toBe('Anonymous');
      });
    });

    it('should display user name', async () => {
      setToken('fake');
      const App = wrapProviders(withLoadedSession(createComponent()));
      const { container } = await render(<App />);
      expect(container.textContent).not.toEqual('Anonymous');
      await waitFor(() => {
        expect(container.textContent).toBe('Bob');
      });
    });
  });
});

describe('useSession', () => {
  const App = wrapProviders(() => {
    const { user } = useSession();
    return <div>{user?.name || 'Anonymous'}</div>;
  });

  it('should be anonymous when logged out', async () => {
    const { container } = await render(<App />);
    await waitFor(() => {
      expect(container.textContent).toBe('Anonymous');
    });
  });

  it('should display user name', async () => {
    setToken('fake');
    const { container } = await render(<App />);
    await waitFor(() => {
      expect(container.textContent).toBe('Bob');
    });
  });
});
