import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Divider, Button } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';
import { Breadcrumbs } from 'components';
import { EditShop } from 'modals';

export default ({ shop, onSave }) => {
  return (
    <React.Fragment>
      <Breadcrumbs
        link={<Link to="/shops">Shops</Link>}
        active={shop.name || 'Loading...'}>
        <EditShop
          shop={shop}
          onSave={onSave}
          trigger={<Button primary icon="setting" content="Settings" />}
        />
      </Breadcrumbs>
      <Divider hidden />
      <Menu tabular>
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
      <Divider hidden />
    </React.Fragment>
  );
};
