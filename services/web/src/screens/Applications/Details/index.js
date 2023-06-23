import { Switch, useParams } from 'react-router-dom';

import { Protected } from 'helpers/routes';
import { usePageLoader } from 'stores/page';

import NotFound from 'screens/NotFound';

import { request } from 'utils/api';

import Logs from './Logs';
import Overview from './Overview';

export default function ApplicationDetail() {
  const { id } = useParams();
  const Loader = usePageLoader(async () => {
    const { data } = await request({
      method: 'GET',
      path: `/1/applications/${id}`,
    });
    return {
      application: data,
    };
  });
  return (
    <Loader notFound={<NotFound />}>
      <Switch>
        <Protected exact path="/applications/:id" allowed={Overview} />
        <Protected exact path="/applications/:id/logs" allowed={Logs} />
      </Switch>
    </Loader>
  );
}
