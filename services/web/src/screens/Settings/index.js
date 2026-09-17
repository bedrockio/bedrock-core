import { Redirect, Route, Routes } from '@bedrockio/router';

import Details from './Details';
import Layout from './Layout';
import Notifications from './Notifications';
import Security from './Security';

export default function Settings() {
  return (
    <Layout>
      <Routes>
        <Route exact path="/settings/details" render={Details} />
        <Route exact path="/settings/security" render={Security} />
        <Route exact path="/settings/notifications" render={Notifications} />
        <Redirect to="/settings/details" />
      </Routes>
    </Layout>
  );
}
