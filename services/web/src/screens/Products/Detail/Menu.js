import React from 'react';
import { Menu, Button } from 'semantic';
import { NavLink, Link } from 'react-router-dom';

import { usePage } from 'stores/page';
import { Breadcrumbs, Layout } from 'components';
import EditProduct from 'modals/EditProduct';

import Actions from '../Actions';

export default () => {
  const { product, reload } = usePage();
  return (
    <React.Fragment>
      <Breadcrumbs
        link={<Link to="/products">Products</Link>}
        active={product.name}></Breadcrumbs>
      <Layout horizontal center spread>
        <h1>{product.name}</h1>
        <Layout.Group>
          <Actions product={product} reload={reload} />
          <EditProduct
            product={product}
            onSave={reload}
            trigger={<Button primary icon="gear" content="Settings" />}
          />
        </Layout.Group>
      </Layout>
      <Menu pointing secondary>
        <Menu.Item
          name="Overview"
          to={`/products/${product.id}`}
          as={NavLink}
          exact
        />
      </Menu>
    </React.Fragment>
  );
};
