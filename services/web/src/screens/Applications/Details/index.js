import { Link, Routes, Route, Redirect } from '@bedrockio/router';

import { usePageLoader } from 'stores/page';

import NotFound from 'screens/NotFound';

import { request } from 'utils/api';

import Edit from './Edit';

export default function ApplicationDetail() {
  const Loader = usePageLoader(async (params) => {
    const { data } = await request({
      method: 'GET',
      path: `/1/applications/${params.id}`,
    });
    return {
      application: data,
    };
  });
  return (
    <Loader
      notFound={
        <NotFound
          link={<Link to="/applications">Applications</Link>}
          message="Sorry that application wasn't found."
        />
      }>
      <Routes>
        <Route path="/applications/:id/edit" render={Edit} exact />
        <Redirect path="/applications/:id" to="/applications/:id/edit" />
      </Routes>
    </Loader>
  );
}
