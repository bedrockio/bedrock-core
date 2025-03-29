import { useEffect } from 'react';
import { useSession } from 'stores/session';

export default function Logout() {
  const session = useSession();

  useEffect(() => {
    const logoutUser = async () => {
      await session.logout();
    };

    logoutUser();
  }, [session]);

  return <div />;
}
