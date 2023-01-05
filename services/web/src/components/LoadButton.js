// Simple button that will set its state to loading
// while an asynchronous onClick action is being
// performed.

import React from 'react';
import { Button, Popup, Message } from 'semantic';

export default class LoadButton extends React.Component {
  state = {
    loading: false,
  };

  onClick = async () => {
    this.setState({
      loading: true,
      error: null,
    });

    try {
      await this.props.onClick();

      if (this.mounted) {
        this.setState({
          loading: false,
        });
      }
    } catch (e) {
      if (this.mounted) {
        this.setState({
          loading: false,
          error: e,
        });
      }
    }
  };

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const { onClick, ...rest } = this.props;
    const LoadButton = (
      <Button
        error={this.state.error}
        loading={this.state.loading}
        onClick={this.onClick}
        {...rest}
      />
    );
    if (this.state.error) {
      return (
        <Popup
          basic
          hoverable
          onClick={() => this.setState({ error: null })}
          open={true}
          style={{
            padding: 0,
          }}
          content={
            <Message onClick={() => this.setState({ error: null })} error>
              {this.state.error.message}
            </Message>
          }
          trigger={LoadButton}
        />
      );
    }
    return LoadButton;
  }
}

LoadButton.propTypes = {
  ...Button.propTypes,
};
