import React from 'react';
import { Container, Menu } from 'semantic-ui-react';
import { NavLink } from 'react-router-dom';

export default ({ itemId }) => (
  <Container>
    <Menu tabular>
      <Menu.Item exact name="Overview" to={`/shops/${itemId}`} as={NavLink} />
      <Menu.Item
        exact
        name="Products"
        to={`/shops/${itemId}/products`}
        as={NavLink}
      />
    </Menu>
  </Container>
);
