import React from 'react';
import { SessionProvider, withSession, withLoadedSession, useSession } from '../session';
import { assertHtml, mount } from 'utils/test';

jest.mock('utils/api');
jest.mock('utils/env');

let renderCount;
let snapshot;

beforeEach(() => {
  renderCount = 0;
  snapshot = null;
});

afterEach(() => {
  localStorage.clear();
});

class MyComponent extends React.Component {

  componentDidUpdate(lastProps, lastState, lastContext) {
    snapshot = lastContext;
  }

  render() {
    renderCount++;
    const { user } = this.context;
    return (
      <div>
        {user?.name || 'Anonymous'}
      </div>
    );
  }
}

describe('withSession', () => {

  const Component = withSession(MyComponent);

  it('should be anonymous when logged out', async () => {
    await assertHtml(
      <SessionProvider>
        <Component />
      </SessionProvider>,
      '<div>Anonymous</div>',
    );
    expect(renderCount).toBe(2);
  });

  it('should display user name', async () => {
    localStorage.setItem('jwt', 'fake');
    await assertHtml(
      <SessionProvider>
        <Component />
      </SessionProvider>,
      '<div>Bob</div>'
    );
    expect(renderCount).toBe(2);
  });

  it('should set the last context as a snapshot', async () => {
    localStorage.setItem('jwt', 'fake');
    await mount(
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
    await assertHtml(
      <SessionProvider>
        <Component />
      </SessionProvider>,
      '<div>Anonymous</div>',
    );
    expect(renderCount).toBe(1);
  });

  it('should display user name', async () => {
    localStorage.setItem('jwt', 'fake');
    await assertHtml(
      <SessionProvider>
        <Component />
      </SessionProvider>,
      '<div>Bob</div>'
    );
    expect(renderCount).toBe(1);
  });

});

describe('useSession', () => {

  const Component = () => {
    renderCount++;
    const { user } = useSession();
    return (
      <div>
        {user?.name || 'Anonymous'}
      </div>
    );
  };

  it('should be anonymous when logged out', async () => {
    await assertHtml(
      <SessionProvider>
        <Component />
      </SessionProvider>,
      '<div>Anonymous</div>',
    );
    expect(renderCount).toBe(2);
  });

  it('should display user name', async () => {
    localStorage.setItem('jwt', 'fake');
    await assertHtml(
      <SessionProvider>
        <Component />
      </SessionProvider>,
      '<div>Bob</div>'
    );
    expect(renderCount).toBe(2);
  });


});
