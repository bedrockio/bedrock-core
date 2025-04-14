import { Routes, Route } from '@bedrockio/router';

import DashboardLayout from 'layouts/Dashboard';

import Dashboard from 'screens/Dashboard';
import Shops from 'screens/Shops';
import Products from 'screens/Products';
import NotFound from 'screens/NotFound';
import Users from 'screens/Users';
import Invites from 'screens/Invites';
import Organizations from 'screens/Organizations';
import Settings from 'screens/Settings';
import Applications from 'screens/Applications';
import AuditLog from 'screens/AuditLog';

import Logout from 'screens/Auth/Logout';

import AcceptInvite from 'screens/Auth/AcceptInvite';

//import 'styles/vars.less';

const App = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" render={Dashboard} exact />
        <Route path="/shops" render={Shops} />
        <Route path="/products" render={Products} />
        <Route path="/users" render={Users} />
        <Route path="/invites" render={Invites} />
        <Route path="/organizations" render={Organizations} />
        <Route path="/settings/:id?" render={Settings} exact />
        <Route path="/applications/:id?" render={Applications} />
        <Route path="/audit-log/:id?" render={AuditLog} />
        <Route path="/accept-invite" render={AcceptInvite} exact />
        <Route path="/logout" render={Logout} exact />
        <Route render={NotFound} />
      </Routes>
    </DashboardLayout>
  );
};

export default App;
