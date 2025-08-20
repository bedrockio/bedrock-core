import { useEffect } from 'react';

import { useSession } from 'stores/session';

export default function Logout() {
  const session = useSession();

  useEffect(() => {
    session.logout();
  }, [session]);

  return <div />;
}
