import { useNavigate } from '@bedrockio/router';
import { useEffect } from 'react';

import { useSession } from 'stores/session';

export default function Logout() {
  const { logout } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    onMount();
  }, []);

  async function onMount() {
    await logout();
    navigate('/login');
  }

  return <div />;
}
