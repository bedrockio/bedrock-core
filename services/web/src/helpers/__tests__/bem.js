import { render } from '@testing-library/react';

import bem from '../bem';

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
