import React from 'react';
import { Table, Header, Divider } from 'semantic';
import screen from 'helpers/screen';
import Menu from './Menu';

// --- Generator: overview-imports
import { Image, Label } from 'semantic';
import { formatDateTime } from 'utils/date';
import { formatAddress } from 'utils/formatting';
import { urlForUpload } from 'utils/uploads';
// --- Generator: end

import DetailsContext from './Context';

@screen
export default class ShopOverview extends React.Component {
  static contextType = DetailsContext;

  render() {
    const { item } = this.context;
    console.log(item);
    return (
      <React.Fragment>
        <Menu />
        <Divider hidden />
        <Header as="h2">Overview</Header>
        {/* --- Generator: overview-fields */}
        <p>{item.description}</p>
        <Header as="h3">Images</Header>
        <Image.Group size="large">
          {item.images.map((image) => (
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
                {item.categories.map((category) => (
                  <Label key={category.id} content={category.name} />
                ))}
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Address</Table.Cell>
              <Table.Cell>{formatAddress(item.address)}</Table.Cell>
            </Table.Row>
            {/* --- Generator: end */}
            <Table.Row>
              <Table.Cell>Created At</Table.Cell>
              <Table.Cell>{formatDateTime(item.createdAt)}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Updated At</Table.Cell>
              <Table.Cell>{formatDateTime(item.updatedAt)}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </React.Fragment>
    );
  }
}
