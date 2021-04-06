// Simple button that will set its state to loading
// while an asynchronous onClick action is being
// performed.

import React from 'react';
import { Button } from 'semantic';

export default class LoadButton extends React.Component {

  state = {
    loading: false,
  }

  onClick = async () => {
    this.setState({
      loading: true,
    });
    await this.props.onClick();
    if (this.mounted) {
      this.setState({
        loading: false
      });
    }
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const { onClick, ...rest } = this.props;
    return (
      <Button
        loading={this.state.loading}
        onClick={this.onClick}
        {...rest}
      />
    );
  }
}

LoadButton.propTypes = {
  ...Button.propTypes,
};
