import React from 'react';
const Context = React.createContext();

export default Context;

export function withSearchProvider(Component) {
  return function WrapperComponent(props) {
    return (
      <Context.Consumer>
        {(state) => <Component {...props} context={state} />}
      </Context.Consumer>
    );
  };
}
