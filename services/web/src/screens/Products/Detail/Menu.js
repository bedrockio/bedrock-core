import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Button } from 'semantic';
import { NavLink } from 'react-router-dom';
import { Breadcrumbs, Layout } from 'components';

import EditProduct from 'modals/EditProduct';

export default ({ product, onSave }) => {
  return (
    <React.Fragment>
      <Breadcrumbs
        link={<Link to="/products">Products</Link>}
        active={product.name}></Breadcrumbs>
      <Layout horizontal center spread>
        <h1>{product.name}</h1>
        <Layout.Group>
          <EditProduct
            product={product}
            onSave={onSave}
            trigger={<Button primary icon="setting" content="Settings" />}
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
