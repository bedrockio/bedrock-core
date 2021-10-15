// Utils for higher order components. HOCs should work in a predictable
// way and not fail when applied in a different order. This is simple enough
// for standard HOCs, however when applying a React context a reference is
// required to the innermost component to apply the context. To achieve this,
// attach the reference with WrappedComponent. This pattern is followed by
// react-router, allowing interop there as well. Function based components
// don't need to worry about this and should instead be provided a hook with
// useContext.

export function wrapContext(context) {
  return (Component) => {
    const Wrapped = getWrappedComponent(Component);
    Wrapped.contextType = context;
    return Component;
  };
}

export function wrapComponent(Component, Wrapper) {
  Wrapper.WrappedComponent = Component;
  Wrapper.displayName = wrapDisplayName(Component, Wrapper);
  return Wrapper;
}

export function getWrappedComponent(Component) {
  while (Component.WrappedComponent) {
    Component = Component.WrappedComponent;
  }
  return Component;
}

function wrapDisplayName(Component, Wrapper) {
  return `${getDisplayName(Wrapper)}(${getDisplayName(Component)})`;
}

function getDisplayName(Component) {
  return Component.displayName || Component.name || 'Component';
}
