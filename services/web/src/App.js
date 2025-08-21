import { Routes, Route } from '@bedrockio/router';

import DashboardLayout from 'layouts/Dashboard';

import Applications from 'screens/Applications';
import AuditLog from 'screens/AuditLog';
import Dashboard from 'screens/Dashboard';
import Invites from 'screens/Invites';
import NotFound from 'screens/NotFound';
import Organizations from 'screens/Organizations';
import Products from 'screens/Products';
import Settings from 'screens/Settings';
import Shops from 'screens/Shops';
import Templates from 'screens/Templates';
import Users from 'screens/Users';

import Logout from 'screens/Auth/Logout';

import AcceptInvite from 'screens/Auth/AcceptInvite';

export default function App() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" render={Dashboard} exact />
        <Route path="/shops" render={Shops} />
        <Route path="/products" render={Products} />
        <Route path="/settings" render={Settings} />
        <Route path="/users/invites" render={Invites} exact />
        <Route path="/users" render={Users} />
        <Route path="/organizations" render={Organizations} />
        <Route path="/templates" render={Templates} />
        <Route path="/applications" render={Applications} />
        <Route path="/audit-log" render={AuditLog} />
        <Route path="/accept-invite" render={AcceptInvite} exact />
        <Route path="/logout" render={Logout} exact />
        <Route render={NotFound} />
      </Routes>
    </DashboardLayout>
  );
}
