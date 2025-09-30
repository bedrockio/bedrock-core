import { Route, Routes } from '@bedrockio/router';

import DashboardLayout from 'layouts/Dashboard';

import Applications from 'screens/Applications';
import AuditLog from 'screens/AuditLog';
import AcceptInvite from 'screens/Auth/AcceptInvite';
import AcceptInviteAuthenticated from 'screens/Auth/AcceptInviteAuthenticated';
import Logout from 'screens/Auth/Logout';
import Dashboard from 'screens/Dashboard';
import Drugs from 'screens/Drugs';
import Invites from 'screens/Invites';
import NotFound from 'screens/NotFound';
import Organizations from 'screens/Organizations';
import Settings from 'screens/Settings';
import Symptoms from 'screens/Symptoms';
import Templates from 'screens/Templates';
import Users from 'screens/Users';

export default function App() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" render={Dashboard} exact />
        <Route path="/drugs" render={Drugs} />
        <Route path="/symptoms" render={Symptoms} />
        <Route path="/settings" render={Settings} />
        <Route path="/users/invites" render={Invites} exact />
        <Route path="/users" render={Users} />
        <Route path="/organizations" render={Organizations} />
        <Route path="/templates" render={Templates} />
        <Route path="/applications" render={Applications} />
        <Route path="/audit-log" render={AuditLog} />
        <Route path="/accept-invite" render={AcceptInviteAuthenticated} exact />
        <Route path="/logout" render={Logout} exact />
        <Route render={NotFound} />
      </Routes>
    </DashboardLayout>
  );
}
