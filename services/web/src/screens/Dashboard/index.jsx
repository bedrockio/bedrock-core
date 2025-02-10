import React from 'react';
import { Dashboard } from '../../layouts/Dashboard';

import { useSession } from '../../stores/session';

export function HomePage() {
  const { user } = useSession();
  return (
    <Dashboard>
      <div>
        Hello {user.name} ({user.email}) from dashboard
      </div>
    </Dashboard>
  );
}
