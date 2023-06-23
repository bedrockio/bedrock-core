import React from 'react';

import ErrorMessage from './ErrorMessage';

export default class ErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    return { error };
  }

  constructor(props) {
    super(props);
    this.state = {
      error: props.error,
    };
  }

  render() {
    const { error } = this.state;
    const { children, notFound } = this.props;
    if (error) {
      if (error.status === 404 && notFound) {
        return notFound;
      } else {
        return <ErrorMessage error={error} />;
      }
    } else {
      return children;
    }
  }
}
