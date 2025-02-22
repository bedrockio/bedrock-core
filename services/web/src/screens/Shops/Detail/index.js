import { Link, Switch, Route } from 'react-router-dom';

import { Protected } from 'helpers/routes';
import { usePageLoader } from 'contexts/page';

import NotFound from 'screens/NotFound';

import { request } from 'utils/api';

import Overview from './Overview';

// --- Generator: detail-imports
import Products from './Products';
// --- Generator: end

export default function ShopDetail() {
  const Loader = usePageLoader(async (params) => {
    const { data } = await request({
      method: 'GET',
      path: `/1/shops/${params.id}`,
    });
    return {
      shop: data,
    };
  });
  return (
    <Loader
      notFound={
        <NotFound
          link={<Link to="/shops">Shops</Link>}
          message="Sorry that shop wasn't found."
        />
      }>
      <Switch>
        <Protected exact path="/shops/:id" allowed={Overview} />
        {/* --- Generator: routes */}
        <Protected exact path="/shops/:id/products" allowed={Products} />
        {/* --- Generator: end */}
        <Route component={NotFound} />
      </Switch>
    </Loader>
  );
}
