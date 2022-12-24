import React from 'react';

import bem from 'helpers/bem';

import './connection-error.less';

let stable = true;

@bem
export default class ConnectionError extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stable,
    };
  }

  componentDidMount() {
    window.addEventListener('connectionstable', this.onStable);
    window.addEventListener('connectionunstable', this.onUnstable);
  }

  componentWillUnmount() {
    window.removeEventListener('connectionstable', this.onStable);
    window.removeEventListener('connectionunstable', this.onUnstable);
  }

  getModifiers() {
    const { stable } = this.state;
    return [stable ? null : 'active'];
  }

  onStable = () => {
    stable = true;
    this.setState({
      stable,
    });
  };

  onUnstable = () => {
    stable = false;
    this.setState({
      stable,
    });
  };

  render() {
    return (
      <div className={this.getBlockClass()}>
        Your network connection may be unstable.
      </div>
    );
  }
}
