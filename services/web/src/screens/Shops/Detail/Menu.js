import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Button } from 'semantic';
import { NavLink } from 'react-router-dom';
import { Breadcrumbs, Layout } from 'components';

import EditShop from 'modals/EditShop';

export default ({ shop, onSave }) => {
  return (
    <React.Fragment>
      <Breadcrumbs
        link={<Link to="/shops">Shops</Link>}
        active={shop.name}>
      </Breadcrumbs>
      <Layout horizontal center spread>
        <h1>{shop.name} Shop</h1>
        <Layout.Group>
        <EditShop
          shop={shop}
          onSave={onSave}
          trigger={<Button primary icon="setting" content="Settings" />}
        />
          </Layout.Group>
      </Layout>
      <Menu pointing secondary>
        <Menu.Item name="Overview" to={`/shops/${shop.id}`} as={NavLink} exact />
        {/* --- Generator: menus */}
        <Menu.Item
          name="Products"
          to={`/shops/${shop.id}/products`}
          as={NavLink}
          exact
        />
        {/* --- Generator: end */}
      </Menu>
    </React.Fragment>
  );
};
