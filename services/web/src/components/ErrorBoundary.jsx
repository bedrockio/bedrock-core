import PropTypes from 'prop-types';
import React from 'react';
import { PiArrowClockwiseBold } from 'react-icons/pi';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="mx-4 my-12 p-8">
          <CardContent className="flex flex-col gap-4 p-0">
            <h3 className="text-xl font-bold">Something went wrong</h3>
            <p className="text-muted-foreground">
              An error occurred while rendering this component. You can try to
              reload the page or continue using other parts of the application.
            </p>
            <div className="flex gap-3">
              <Button onClick={this.handleReset}>
                <PiArrowClockwiseBold />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}>
                Reload Page
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
