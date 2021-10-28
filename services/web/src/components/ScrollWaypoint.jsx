import React from 'react';
import PropTypes from 'prop-types';
import bem from 'helpers/bem';

const SUPPORTED = !!window.IntersectionObserver;

class ScrollWaypoint extends React.Component {
  static queued = 0;

  // Ensures that when many components are
  // mounted at a time the order in which they
  // are mounted will be respected with a timeout
  // for them all to resolve in a staggered fashion.
  static getGlobalDelay() {
    this.queued++;
    return new Promise((resolve) => {
      setTimeout(() => {
        this.queued--;
        resolve();
      }, this.queued * 200);
    });
  }

  constructor(props) {
    super(props);
    this.ref = React.createRef();
    this.entered = false;
  }

  // Lifecycle

  componentDidMount() {
    this.createObserver();
  }

  componentWillUnmount() {
    this.destroyObserver();
  }

  // Observer

  async createObserver() {
    const { current: el } = this.ref;
    if (SUPPORTED && el) {
      await ScrollWaypoint.getGlobalDelay();
      const { threshold } = this.props;
      this.observer = new IntersectionObserver(this.onElementObserve, {
        threshold,
        rootMargin: '0% 0% 0% 0%',
      });
      this.observer.observe(el);
    }
  }

  destroyObserver() {
    if (SUPPORTED && this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  // Events

  onElementObserve = (entries) => {
    const [entry] = entries;
    const entered = entry.isIntersecting;
    if (entered !== this.entered) {
      if (entered) {
        this.props.onEnter();
      } else {
        this.props.onLeave();
      }
      this.entered = entered;
    }
  };

  render() {
    return (
      <div ref={this.ref} className={this.getBlockClass()}>
        {this.props.children}
      </div>
    );
  }
}

ScrollWaypoint.propTypes = {
  onEnter: PropTypes.func,
  onLeave: PropTypes.func,
  threshold: PropTypes.number,
};

ScrollWaypoint.defaultProps = {
  onEnter: () => {},
  onLeave: () => {},
  threshold: 0.5,
};

export default bem(ScrollWaypoint);
