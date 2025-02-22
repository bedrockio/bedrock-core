import { Link, Switch, Route } from 'react-router-dom';

import { Protected } from 'helpers/routes';
import { usePageLoader } from 'contexts/page';

import NotFound from 'screens/NotFound';

import { request } from 'utils/api';

import Overview from './Overview';

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
      <Switch>
        <Protected exact path="/organizations/:id" allowed={Overview} />
        <Route component={NotFound} />
      </Switch>
    </Loader>
  );
}
