import { omit } from 'lodash';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';

import { useClass } from 'helpers/bem';

const SUPPORTED = !!window.IntersectionObserver;

let queued = 0;

// Ensures that when many components are
// mounted at a time the order in which they
// are mounted will be respected with a timeout
// for them all to resolve in a staggered fashion.
function getGlobalDelay() {
  queued++;
  return new Promise((resolve) => {
    setTimeout(() => {
      queued--;
      resolve();
    }, queued * 200);
  });
}

export default function ScrollWaypoint(props) {
  const { threshold, onEnter, onLeave } = props;

  const ref = useRef();

  const { className } = useClass('scroll-waypoint');

  const [observer, setObserver] = useState();

  // Lifecycle

  useEffect(() => {
    createObserver();
  }, []);

  useEffect(() => {
    if (observer) {
      return () => {
        destroyObserver(observer);
      };
    }
  }, [observer]);

  // Observer

  async function createObserver() {
    const { current: el } = ref;
    let observer;
    if (SUPPORTED && el) {
      await getGlobalDelay();
      observer = new IntersectionObserver(onElementObserve, {
        threshold,
        rootMargin: '25% 25% 25% 25%',
      });
      observer.observe(el);
    }

    setObserver(observer);
  }

  function destroyObserver(observer) {
    if (SUPPORTED && observer) {
      observer.disconnect();
      observer = null;
    }
  }

  // Events

  function onElementObserve(entries) {
    const [entry] = entries;
    const entered = entry.isIntersecting;
    if (entered) {
      onEnter(entry.target);
    } else {
      onLeave(entry.target);
    }
  }

  const divProps = omit(props, Object.keys(ScrollWaypoint.propTypes));
  return (
    <div {...divProps} ref={ref} className={className}>
      {props.children}
    </div>
  );
}

ScrollWaypoint.propTypes = {
  onEnter: PropTypes.func,
  onLeave: PropTypes.func,
  threshold: PropTypes.number,
};

ScrollWaypoint.defaultProps = {
  onEnter: () => {},
  onLeave: () => {},
  threshold: 0.1,
};
