import { Link, Routes, Route, Redirect } from '@bedrockio/router';

import { usePageLoader } from 'stores/page';

import NotFound from 'screens/NotFound';

import { request } from 'utils/api';

import Edit from './Edit';

export default function OrganizationDetail() {
  const Loader = usePageLoader(async (params) => {
    const { data } = await request({
      method: 'GET',
      path: `/1/organizations/${params.id}`,
    });
    return {
      organization: data,
    };
  });
  return (
    <Loader
      notFound={
        <NotFound
          link={<Link to="/organizations">Organizations</Link>}
          message="Sorry that organization wasn't found."
        />
      }>
      <Routes>
        <Route path="/organizations/:id/edit" render={Edit} exact />
        <Redirect path="/organizations/:id" to="/organizations/:id/edit" />
        <Route render={NotFound} />
      </Routes>
    </Loader>
  );
}
