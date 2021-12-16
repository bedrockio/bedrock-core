import React from 'react';
import { Route } from 'react-router-dom';
import Loading from 'screens/Loading';

export default class RouteWrapper extends React.Component {
  render() {
    const Component = this.props.component;
    return (
      <Route
        component={(props) => (
          <React.Suspense fallback={Loading}>
            <Component {...props} />
          </React.Suspense>
        )}
      />
    );
  }
}

RouteWrapper.propTypes = {
  ...Route.propTypes,
};
