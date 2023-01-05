import React from 'react';
import { Table, Image, Divider } from 'semantic';

import screen from 'helpers/screen';
import { formatDateTime } from 'utils/date';
import { urlForUpload } from 'utils/uploads';

import Menu from './Menu';
import DetailsContext from './Context';

@screen
export default class ProductOverview extends React.Component {
  static contextType = DetailsContext;

  render() {
    const { item } = this.context;
    return (
      <React.Fragment>
        <Menu />
        <Divider hidden />
        <Image.Group size="small">
          {item.images.map((image) => (
            <Image key={image.id} src={urlForUpload(image)} />
          ))}
        </Image.Group>
        <Table definition>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Description</Table.Cell>
              <Table.Cell>{item.description || 'None'}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Is Featured</Table.Cell>
              <Table.Cell>{item.isFeatured ? 'Yes' : 'No'}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Price Usd</Table.Cell>
              <Table.Cell>{item.priceUsd || 'None'}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Expires At</Table.Cell>
              <Table.Cell>
                {item.expiresAt ? formatDateTime(item.expiresAt) : 'None'}
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Selling Points</Table.Cell>
              <Table.Cell>{item.sellingPoints.join(', ') || 'None'}</Table.Cell>
            </Table.Row>
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
