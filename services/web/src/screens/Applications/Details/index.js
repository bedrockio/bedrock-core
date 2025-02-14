import { Link, Routes, Route } from '@bedrockio/router';

import { usePageLoader } from 'stores/page';

import NotFound from 'screens/NotFound';

import { request } from 'utils/api';

import Overview from './Overview';
import Logs from './Logs';

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
        <Route path="/applications/:id" render={Overview} exact />
        <Route path="/applications/:id/logs" render={Logs} exact />
        <Route render={NotFound} />
      </Routes>
    </Loader>
  );
}
