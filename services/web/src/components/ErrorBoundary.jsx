import { Button, Group, Paper, Stack, Text, Title } from '@mantine/core';
import PropTypes from 'prop-types';
import React from 'react';
import { PiArrowClockwiseBold } from 'react-icons/pi';

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
        <Paper p="xl" shadow="sm" withBorder my="xl" mx="md">
          <Stack spacing="md">
            <Title order={3}>Something went wrong</Title>
            <Text color="dimmed">
              An error occurred while rendering this component. You can try to
              reload the page or continue using other parts of the application.
            </Text>
            <Group>
              <Button
                onClick={this.handleReset}
                leftSection={<PiArrowClockwiseBold />}>
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}>
                Reload Page
              </Button>
            </Group>
          </Stack>
        </Paper>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
