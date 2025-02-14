import { Link, Routes, Route } from '@bedrockio/router';

import { usePageLoader } from 'stores/page';

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
      <Routes>
        <Route exact path="/shops/:id" render={Overview} />
        {/* --- Generator: routes */}
        <Route exact path="/shops/:id/products" render={Products} />
        {/* --- Generator: end */}
        <Route render={NotFound} />
      </Routes>
    </Loader>
  );
}
