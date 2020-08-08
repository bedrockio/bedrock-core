import Adapter from 'enzyme-adapter-react-16';
import { configure, mount as enzymeMount } from 'enzyme';
import { act } from 'react-dom/test-utils';

configure({ adapter: new Adapter() });

export async function assertHtml(el, expected) {
  const wrapper = await mount(el);

  let html = wrapper.html();
  // ReactDOMServer doesn't render srcset correctly.
  // https://github.com/facebook/react/issues/4653
  html = html.replace(/srcSet/g, 'srcset');
  expect(html).toBe(expected);
}

export function createPropMock(Class, prop) {
  let val;
  Object.defineProperty(Class.prototype, prop, {
    get: () => val,
    set: () => {}
  });
  return function(newVal) {
    val = newVal;
  };
}

export function createRefMock(Class, prop) {
  const propMock = createPropMock(Class, prop);
  return function(mockNode) {
    propMock({
      current: mockNode
    });
  };
}

export async function mount(el) {
  const wrapper = enzymeMount(el);

  await flushPromises();

  return wrapper.update();
}

// componentDidMount may be async so need to flush promises
async function flushPromises() {
  await act(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  });
}

export { shallow } from 'enzyme';
