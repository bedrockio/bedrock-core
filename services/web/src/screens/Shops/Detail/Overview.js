import React from 'react';
/* eslint-disable-next-line */
import { Table, Header, Divider } from 'semantic';

import { usePage } from 'stores/page';
import screen from 'helpers/screen';

// --- Generator: overview-imports
/* eslint-disable-next-line */
import { Image, Label } from 'semantic';

import { formatDateTime } from 'utils/date';
import { formatAddress } from 'utils/formatting';
import { urlForUpload } from 'utils/uploads';
// --- Generator: end

import Menu from './Menu';

function ShopOverview() {
  const { shop } = usePage();
  return (
    <React.Fragment>
      <Menu />
      <Divider hidden />
      <Header as="h2">Overview</Header>
      {/* --- Generator: overview-fields */}
      <p>{shop.description}</p>
      <Header as="h3">Images</Header>
      <Image.Group size="large">
        {shop.images.map((image) => (
          <Image key={image} src={urlForUpload(image)} />
        ))}
      </Image.Group>
      {/* --- Generator: end */}
      <Table definition>
        <Table.Body>
          {/* --- Generator: overview-rows */}
          <Table.Row>
            <Table.Cell>Categories</Table.Cell>
            <Table.Cell>
              {shop.categories.map((category) => (
                <Label key={category.id} content={category.name} />
              ))}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Address</Table.Cell>
            <Table.Cell>{formatAddress(shop.address)}</Table.Cell>
          </Table.Row>
          {/* --- Generator: end */}
          <Table.Row>
            <Table.Cell>Created At</Table.Cell>
            <Table.Cell>{formatDateTime(shop.createdAt)}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Updated At</Table.Cell>
            <Table.Cell>{formatDateTime(shop.updatedAt)}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    </React.Fragment>
  );
}

export default screen(ShopOverview);
