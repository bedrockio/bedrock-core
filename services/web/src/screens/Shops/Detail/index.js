import { Switch, useParams } from 'react-router-dom';

import { usePageLoader } from 'stores/page';
import { Protected } from 'helpers/routes';

import { request } from 'utils/api';

import Overview from './Overview';
import NotFound from './NotFound';

// --- Generator: detail-imports
import Products from './Products';
// --- Generator: end

export default function ShopDetail() {
  const { id } = useParams();
  const Loader = usePageLoader(async () => {
    const { data } = await request({
      method: 'GET',
      path: `/1/shops/${id}`,
      params: {
        include: 'categories',
      },
    });
    return {
      shop: data,
    };
  });
  return (
    <Loader notFound={<NotFound />}>
      <Switch>
        <Protected exact path="/shops/:id" allowed={Overview} />
        {/* --- Generator: routes */}
        <Protected exact path="/shops/:id/products" allowed={Products} />
        {/* --- Generator: end */}
      </Switch>
    </Loader>
  );
}
