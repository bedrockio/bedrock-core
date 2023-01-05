import React from 'react';
import { MemoryRouter, withRouter } from 'react-router-dom';
import { render } from '@testing-library/react';

import bem from '../bem';

describe('class components', () => {
  it('should render block class', async () => {
    class MyComponent extends React.Component {
      render() {
        return <div className={this.getBlockClass()} />;
      }
    }
    const App = bem(MyComponent);
    const { container } = await render(<App />);
    expect(container.firstChild.className).toBe('my-component');
  });

  it('should render block class with modifiers', async () => {
    class MyComponent extends React.Component {
      getModifiers() {
        return ['active', null];
      }

      render() {
        return <div className={this.getBlockClass()} />;
      }
    }
    const App = bem(MyComponent);
    const { container } = await render(<App />);
    expect(container.firstChild.className).toBe(
      'my-component my-component--active'
    );
  });

  it('should render element class', async () => {
    class MyComponent extends React.Component {
      render() {
        return <div className={this.getElementClass('button')} />;
      }
    }
    const App = bem(MyComponent);
    const { container } = await render(<App />);
    expect(container.firstChild.className).toBe('my-component__button');
  });

  it('should render element class with modifiers', async () => {
    class MyComponent extends React.Component {
      render() {
        return (
          <div className={this.getElementClass('button', 'active', null)} />
        );
      }
    }
    const App = bem(MyComponent);
    const { container } = await render(<App />);
    expect(container.firstChild.className).toBe(
      'my-component__button my-component__button--active'
    );
  });
});

describe('functional components', () => {
  it('should render block class', async () => {
    function MyComponent({ getBlockClass }) {
      return <div className={getBlockClass()} />;
    }
    const App = bem(MyComponent);
    const { container } = await render(<App />);
    expect(container.firstChild.className).toBe('my-component');
  });

  it('should render block class with modifiers', async () => {
    function MyComponent({ getBlockClass }) {
      return <div className={getBlockClass('active', null)} />;
    }
    const App = bem(MyComponent);
    const { container } = await render(<App />);
    expect(container.firstChild.className).toBe(
      'my-component my-component--active'
    );
  });

  it('should render element class', async () => {
    function MyComponent({ getElementClass }) {
      return <div className={getElementClass('button')} />;
    }
    const App = bem(MyComponent);
    const { container } = await render(<App />);
    expect(container.firstChild.className).toBe('my-component__button');
  });

  it('should render element class with modifiers', async () => {
    function MyComponent({ getElementClass }) {
      return <div className={getElementClass('button', 'active', null)} />;
    }
    const App = bem(MyComponent);
    const { container } = await render(<App />);
    expect(container.firstChild.className).toBe(
      'my-component__button my-component__button--active'
    );
  });
});

describe('withRouter', () => {
  function wrapProviders(Component) {
    return () => {
      return (
        <MemoryRouter>
          <Component />
        </MemoryRouter>
      );
    };
  }

  describe('class components', () => {
    it('should allow hoc first', async () => {
      class MyComponent extends React.Component {
        render() {
          return (
            <div className={this.getBlockClass()}>
              {this.props.location.pathname}
            </div>
          );
        }
      }
      const App = wrapProviders(bem(withRouter(MyComponent)));
      const { container } = await render(<App />);
      expect(container.firstChild.className).toBe('my-component');
      expect(container.textContent).toBe('/');
    });

    it('should allow hoc last', async () => {
      class MyComponent extends React.Component {
        render() {
          return (
            <div className={this.getBlockClass()}>
              {this.props.location.pathname}
            </div>
          );
        }
      }
      const App = wrapProviders(withRouter(bem(MyComponent)));
      const { container } = await render(<App />);
      expect(container.firstChild.className).toBe('my-component');
      expect(container.textContent).toBe('/');
    });
  });

  describe('functional components', () => {
    it('should allow hoc first', async () => {
      function MyComponent({ getBlockClass, location }) {
        return <div className={getBlockClass()}>{location.pathname}</div>;
      }
      const App = wrapProviders(bem(withRouter(MyComponent)));
      const { container } = await render(<App />);
      expect(container.firstChild.className).toBe('my-component');
      expect(container.textContent).toBe('/');
    });

    it('should allow hoc last', async () => {
      function MyComponent({ getBlockClass, location }) {
        return <div className={getBlockClass()}>{location.pathname}</div>;
      }
      const App = wrapProviders(withRouter(bem(MyComponent)));
      const { container } = await render(<App />);
      expect(container.firstChild.className).toBe('my-component');
      expect(container.textContent).toBe('/');
    });
  });
});
