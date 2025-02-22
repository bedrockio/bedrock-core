import { Link, Switch, Route } from 'react-router-dom';

import { usePageLoader } from 'contexts/page';
import { Protected } from 'helpers/routes';

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
      <Switch>
        <Protected exact path="/applications/:id" allowed={Overview} />
        <Protected exact path="/applications/:id/logs" allowed={Logs} />
        <Route component={NotFound} />
      </Switch>
    </Loader>
  );
}
