import React from 'react';
import { withRouter } from '@bedrockio/router';

class ScrollProvider extends React.Component {
  componentDidMount() {
    this.detach = this.props.history.listen(this.onRouteChange);
    this.pathname = this.props.location.pathname;
  }

  componentWillUnmount() {
    this.detach();
  }

  onRouteChange = ({ pathname }) => {
    if (pathname !== this.pathname) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      this.pathname = pathname;
    }
  };

  render() {
    return this.props.children;
  }
}

export default withRouter(ScrollProvider);
