import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Button } from 'semantic';
import { NavLink } from 'react-router-dom';
import { Breadcrumbs, Layout } from 'components';

import DetailsContext from './Context';
import Actions from '../Actions';
import EditShop from 'modals/EditShop';

export default () => {
  const { item, reload } = useContext(DetailsContext);

  return (
    <React.Fragment>
      <Breadcrumbs
        link={<Link to="/shops">Shops</Link>}
        active={item.name}></Breadcrumbs>
      <Layout horizontal center spread>
        <h1>{item.name}</h1>
        <Layout.Group>
          <Actions item={item} reload={reload} />
          <EditShop
            shop={item}
            onSave={reload}
            trigger={<Button primary icon="setting" content="Settings" />}
          />
        </Layout.Group>
      </Layout>
      <Menu pointing secondary>
        <Menu.Item
          name="Overview"
          to={`/shops/${item.id}`}
          as={NavLink}
          exact
        />
        {/* --- Generator: menus */}
        <Menu.Item
          name="Products"
          to={`/shops/${item.id}/products`}
          as={NavLink}
          exact
        />
        {/* --- Generator: end */}
      </Menu>
    </React.Fragment>
  );
};
