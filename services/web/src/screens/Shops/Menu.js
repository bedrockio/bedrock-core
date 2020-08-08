import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Divider, Button } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';
import { Breadcrumbs } from 'components';
import { EditShop } from 'modals';

export default ({ id, shop, onSave }) => (
  <React.Fragment>
    <Breadcrumbs link={<Link to="/shops">Shops</Link>} active={shop?.name || 'Loading...'}>
      <EditShop
        item={shop}
        onSave={onSave}
        trigger={
          <Button
            primary
            icon="setting"
            content="Settings"
          />
        }
      />
    </Breadcrumbs>
    <Divider hidden />
    <Menu tabular>
      <Menu.Item name="Overview" to={`/shops/${id}`} as={NavLink} exact />
      <Menu.Item
        name="Products"
        to={`/shops/${id}/products`}
        as={NavLink}
        exact
      />
    </Menu>
    <Divider hidden />
  </React.Fragment>
);
