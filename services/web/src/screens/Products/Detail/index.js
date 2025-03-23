import { Link, Routes, Route } from '@bedrockio/router';

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
      <Routes>
        <Route path="/products/:id" render={Overview} exact />
        <Route render={NotFound} />
      </Routes>
    </Loader>
  );
}
