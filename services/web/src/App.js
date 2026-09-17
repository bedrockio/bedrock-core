import { Route, Routes } from '@bedrockio/router';

import { UnsavedGuardProvider } from 'components/UnsavedGuard';

import DashboardLayout from 'layouts/Dashboard';

import AcceptInviteAuthenticated from 'screens/Auth/AcceptInviteAuthenticated';
import Logout from 'screens/Auth/Logout';
import Dashboard from 'screens/Dashboard';
import Invites from 'screens/Invites';
import NotFound from 'screens/NotFound';
import Organization from 'screens/Organization';
import Organizations from 'screens/Organizations';
import Products from 'screens/Products';
import Settings from 'screens/Settings';
import Shops from 'screens/Shops';
import Users from 'screens/Users';

export default function App() {
  return (
    <DashboardLayout>
      <UnsavedGuardProvider>
        <Routes>
          <Route path="/" render={Dashboard} exact />
          <Route path="/shops" render={Shops} />
          <Route path="/products" render={Products} />
          <Route path="/settings" render={Settings} />
          <Route path="/users/invites" render={Invites} exact />
          <Route path="/users" render={Users} />
          <Route path="/organizations" render={Organizations} />
          <Route path="/organization" render={Organization} />
          <Route path="/accept-invite" render={AcceptInviteAuthenticated} exact />
          <Route path="/logout" render={Logout} exact />
          <Route render={NotFound} />
        </Routes>
      </UnsavedGuardProvider>
    </DashboardLayout>
  );
}
