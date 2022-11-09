import React, { useContext } from 'react';
import { Menu, Button } from 'semantic';
import { NavLink, Link } from 'react-router-dom';
import { Breadcrumbs, Layout } from 'components';

import DetailsContext from './Context';
import EditProduct from 'modals/EditProduct';
import Actions from '../Actions';

export default () => {
  const { item, reload } = useContext(DetailsContext);
  return (
    <React.Fragment>
      <Breadcrumbs
        link={<Link to="/products">Products</Link>}
        active={item.name}></Breadcrumbs>
      <Layout horizontal center spread>
        <h1>{item.name}</h1>
        <Layout.Group>
          <Actions item={item} reload={reload} />
          <EditProduct
            product={item}
            onSave={reload}
            trigger={<Button primary icon="gear" content="Settings" />}
          />
        </Layout.Group>
      </Layout>
      <Menu pointing secondary>
        <Menu.Item
          name="Overview"
          to={`/products/${item.id}`}
          as={NavLink}
          exact
        />
      </Menu>
    </React.Fragment>
  );
};
