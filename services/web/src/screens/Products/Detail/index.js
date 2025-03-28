import { Link, Routes, Route, Redirect } from '@bedrockio/router';

import { usePageLoader } from 'stores/page';

import NotFound from 'screens/NotFound';

import { request } from 'utils/api';

import Edit from './Edit.js';

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
      <Routes>
        <Route path="/products/:id/edit" render={Edit} exact />
        <Redirect from="/products/:id" to="/products/:id/edit" />
        <Route render={NotFound} />
      </Routes>
    </Loader>
  );
}
