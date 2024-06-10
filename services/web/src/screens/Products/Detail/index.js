import { Link, Switch, Route } from 'react-router-dom';

import { Protected } from 'helpers/routes';
import { usePageLoader } from 'stores/page';

import NotFound from 'screens/NotFound';

import { request } from 'utils/api';

import Overview from './Overview';

export default function ProductDetail() {
  const Loader = usePageLoader(async (params) => {
    const { data } = await request({
      method: 'GET',
      path: `/1/products/${params.id}`,
    });
    return {
      product: data,
    };
  });
  return (
    <Loader
      notFound={
        <NotFound
          link={<Link to="/products">Products</Link>}
          message="Sorry that product wasn't found."
        />
      }>
      <Switch>
        <Protected exact path="/products/:id" allowed={Overview} />
        <Route component={NotFound} />
      </Switch>
    </Loader>
  );
}
