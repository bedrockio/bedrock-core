import { Switch, useParams } from 'react-router-dom';

import { usePageLoader } from 'stores/page';
import { Protected } from 'helpers/routes';

import { request } from 'utils/api';

import NotFound from './NotFound';
import Overview from './Overview';

export default function OrganizationDetail() {
  const { id } = useParams();
  const Loader = usePageLoader(async () => {
    const { data } = await request({
      method: 'GET',
      path: `/1/organizations/${id}`,
    });
    return {
      organization: data,
    };
  });
  return (
    <Loader notFound={<NotFound />}>
      <Switch>
        <Protected exact path="/organizations/:id" allowed={Overview} />
      </Switch>
    </Loader>
  );
}
