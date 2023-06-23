import { Switch, useParams } from 'react-router-dom';

import { usePageLoader } from 'stores/page';
import { Protected } from 'helpers/routes';

import { request } from 'utils/api';

import Overview from './Overview';
import NotFound from './NotFound';

export default function UserDetail() {
  const { id } = useParams();
  const Loader = usePageLoader(async () => {
    const { data } = await request({
      method: 'GET',
      path: `/1/users/${id}`,
    });
    return {
      user: data,
    };
  });
  return (
    <Loader notFound={<NotFound />}>
      <Switch>
        <Protected exact path="/users/:id" allowed={Overview} />
      </Switch>
    </Loader>
  );
}
