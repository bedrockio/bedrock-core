import { Link, Switch, Route } from 'react-router-dom';

import { Protected } from 'helpers/routes';
import { usePageLoader } from 'contexts/page';

import NotFound from 'screens/NotFound';

import { request } from 'utils/api';

import Overview from './Overview';

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
      <Switch>
        <Protected exact path="/users/:id" allowed={Overview} />
        <Route component={NotFound} />
      </Switch>
    </Loader>
  );
}
