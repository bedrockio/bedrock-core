import React from 'react';
import { Container, Menu } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';

export default ({ shop }) => (
  <Container>
    <Menu tabular>
      <Menu.Item exact name="Overview" to={`/shops/${shop.id}`} as={NavLink} />
      <Menu.Item
        exact
        name="Products"
        to={`/shops/${shop.id}/products`}
        as={NavLink}
      />
    </Menu>
  </Container>
);
