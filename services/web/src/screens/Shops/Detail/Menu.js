import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Divider, Button } from 'semantic';
import { NavLink } from 'react-router-dom';
import { Breadcrumbs, Layout } from 'components';

import EditShop from 'modals/EditShop';

export default ({ shop, onSave }) => {
  return (
    <React.Fragment>
      <Breadcrumbs
        link={<Link to="/shops">Shops</Link>}
        active={shop.name || 'Loading...'}>
      </Breadcrumbs>
      <div style={{ display:'block', height:'15px'}} />
      <Layout horizontal center spread>
        <h1 style={{ margin:'0' }}>{shop.name || 'Loading'} Shop</h1>
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
      <div style={{ display:'block', height:'10px'}} />
    </React.Fragment>
  );
};
