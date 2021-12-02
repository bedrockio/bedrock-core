import React from 'react';
import bem from 'helpers/bem';

import './connection-error.less';

@bem
export default class ConnectionError extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stable: true,
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
    this.setState({
      stable: true,
    });
  };

  onUnstable = () => {
    this.setState({
      stable: false,
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
