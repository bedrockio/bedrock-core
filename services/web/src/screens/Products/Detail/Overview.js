import React from 'react';
import { Table, Image, Divider } from 'semantic';

import { PageContext } from 'stores/page';

import { formatDateTime } from 'utils/date';
import { urlForUpload } from 'utils/uploads';
import Meta from 'components/Meta';

import Menu from './Menu';

export default class ProductOverview extends React.Component {
  static contextType = PageContext;

  render() {
    const { product } = this.context;
    return (
      <React.Fragment>
        <Meta title={product.name} />
        <Menu />
        <Divider hidden />
        <Image.Group size="small">
          {product.images.map((image) => {
            return <Image key={image} src={urlForUpload(image)} />;
          })}
        </Image.Group>
        <Table definition>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Description</Table.Cell>
              <Table.Cell>{product.description || 'None'}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Is Featured</Table.Cell>
              <Table.Cell>{product.isFeatured ? 'Yes' : 'No'}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Price Usd</Table.Cell>
              <Table.Cell>{product.priceUsd || 'None'}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Expires At</Table.Cell>
              <Table.Cell>
                {product.expiresAt ? formatDateTime(product.expiresAt) : 'None'}
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Selling Points</Table.Cell>
              <Table.Cell>
                {product.sellingPoints.join(', ') || 'None'}
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Created At</Table.Cell>
              <Table.Cell>{formatDateTime(product.createdAt)}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Updated At</Table.Cell>
              <Table.Cell>{formatDateTime(product.updatedAt)}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </React.Fragment>
    );
  }
}
