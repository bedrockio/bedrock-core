import { useState, useEffect } from 'react';

import { useClass } from 'helpers/bem';

//import './connection-error.less';

export default function ConnectionError() {
  const [stable, setStable] = useState(true);

  const { className } = useClass('connection-error', stable ? null : 'active');

  useEffect(() => {
    const onStable = () => {
      setStable(true);
    };

    const onUnstable = () => {
      setStable(false);
    };

    window.addEventListener('connectionstable', onStable);
    window.addEventListener('connectionunstable', onUnstable);

    return () => {
      window.removeEventListener('connectionstable', onStable);
      window.removeEventListener('connectionunstable', onUnstable);
    };
  }, []);

  if (stable) {
    return null;
  }

  return (
    <div className={className}>Your network connection may be unstable.</div>
  );
}
