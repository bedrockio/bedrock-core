import React from 'react';
import { useAppSession } from 'contexts/appSession';

const Logout = () => {
  const { reset } = useAppSession();

  React.useEffect(() => {
    reset();
    window.location.href = '/';
  }, []);

  return <div></div>;
};

export default Logout;
