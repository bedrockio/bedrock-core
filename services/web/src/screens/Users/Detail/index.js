import { Link, Routes, Route } from '@bedrockio/router';

import { usePageLoader } from 'stores/page';

import NotFound from 'screens/NotFound';

import { request } from 'utils/api';

import Overview from './Overview';
import Edit from './Edit';
import AuditLog from './AuditLog';

export default function UserDetail() {
  const Loader = usePageLoader(async (params) => {
    const { data } = await request({
      method: 'GET',
      path: `/1/users/${params.id}`,
    });
    return {
      user: data,
    };
  });

  return (
    <Loader
      notFound={
        <NotFound
          link={<Link to="/users">Users</Link>}
          message="Sorry that user wasn't found."
        />
      }>
      <Routes>
        <Route exact path="/users/:id" render={Overview} />
        <Route exact path="/users/:id/audit-log" render={AuditLog} />
        <Route exact path="/users/:id/edit" render={Edit} />
        <Route render={NotFound} />
      </Routes>
    </Loader>
  );
}
