import { Redirect, Route, Routes } from '@bedrockio/router';

import Applications from 'screens/Applications';
import AuditLog from 'screens/AuditLog';
import Templates from 'screens/Templates';

import General from './General';
import Layout from './Layout';

export default function Organization() {
  return (
    <Layout>
      <Routes>
        <Route path="/organization" render={General} exact />
        <Route path="/organization/templates" render={Templates} />
        <Route path="/organization/applications" render={Applications} />
        <Route path="/organization/audit-log" render={AuditLog} />
        <Redirect to="/organization" />
      </Routes>
    </Layout>
  );
}
