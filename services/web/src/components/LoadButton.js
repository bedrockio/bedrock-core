// Simple button that will set its state to loading
// while an asynchronous onClick action is being
// performed.

import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';

export default class LoadButton extends React.Component {

  state = {
    loading: false,
  }

  onClick = async () => {
    this.setState({
      loading: true,
    });
    try {
      await this.props.onClick();
    } catch(err) {
      this.props.onError();
    } finally {
      if (this.mounted) {
        this.setState({
          loading: false
        });
      }
    }
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const { onClick, onError, ...rest } = this.props;
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
  onError: PropTypes.func,
};

LoadButton.defaultProps = {
  onError: () => {},
};
