import { useState, useEffect } from 'react';

export function onChange(fn, deps = []) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mounted) {
      fn();
    } else {
      setMounted(true);
    }
  }, deps);
}

export function onMount(fn) {
  useEffect(fn, []);
}

export function onUnmount(fn) {
  useEffect(() => fn, []);
}
