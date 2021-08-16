import React from 'react';
import { Table, Header, Divider } from 'semantic';
import { screen } from 'helpers';
import Menu from './Menu';

// --- Generator: overview-imports
import { Image, Label } from 'semantic';
import { formatDateTime } from 'utils/date';
import { formatAddress } from 'utils/formatting';
import { urlForUpload } from 'utils/uploads';
// --- Generator: end

@screen
export default class ShopOverview extends React.Component {
  render() {
    const { shop } = this.props;
    return (
      <React.Fragment>
        <Menu {...this.props} />
        <Divider hidden />
        {/* --- Generator: overview-fields */}
        <Header as="h2">Overview</Header>
        <p>{shop.description}</p>
        <Header as="h3">Images</Header>
        <Image.Group size="large">
          {shop.images.map((image) => (
            <Image key={image.id} src={urlForUpload(image)} />
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
}
