import { Routes, Route } from '@bedrockio/router';

import DashboardLayout from 'layouts/Dashboard';

import Dashboard from 'screens/Dashboard';
import Shops from 'screens/Shops';
import Products from 'screens/Products';
import NotFound from 'screens/NotFound';
import Users from 'screens/Users';

/*
import Settings from 'screens/Settings';
import Organizations from 'screens/Organizations';
import Applications from 'screens/Applications';
import AuditTrail from 'screens/AuditTrail';
import Invites from 'screens/Invites';
*/

import AcceptInvite from 'screens/Auth/AcceptInvite';
import Logout from 'screens/Auth/Logout';

//import 'styles/vars.less';

const App = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" render={Dashboard} exact />
        <Route path="/shops" render={Shops} />
        <Route path="/products" render={Products} />
        <Route path="/users" render={Users} />

        {/*}
        <Route path="/settings/:id?" render={Settings} exact />
        <Route path="/users/invites" render={Invites} exact />
        <Route path="/organizations/:id?" render={Organizations} />
        
        <Route path="/applications/:id?" render={Applications} />
        <Route path="/audit-trail/:id?" render={AuditTrail} />
        <Route path="/accept-invite" render={AcceptInvite} exact />
        <Route path="/logout" render={Logout} exact />
       
        */}
        <Route render={NotFound} />
      </Routes>
    </DashboardLayout>
  );
};

export default App;
