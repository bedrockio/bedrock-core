import React from 'react';
import { observer, inject } from 'mobx-react';
import { Header, Table, Image } from 'semantic-ui-react';
import { DateTime } from 'luxon';
import { urlForUpload } from 'utils/api';

@inject('shops')
@observer
export default class ShopOverview extends React.Component {
  render() {
    const { shop } = this.props;
    console.log(shop.updatedAt);
    return (
      <div>
        <Header as="h1">{shop.name}</Header>
        <p>{shop.description}</p>
        <Header as="h3">Images</Header>
        <Image.Group size="large">
          {shop.images.map((image) => (
            <Image key={image.id} src={urlForUpload(image)} />
          ))}
        </Image.Group>
        <Header as="h3">Details</Header>
        <Table definition>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Created At</Table.Cell>
              <Table.Cell>
                {DateTime.fromJSDate(shop.createdAt).toLocaleString(
                  DateTime.DATETIME_MED
                )}
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Updated At</Table.Cell>
              <Table.Cell>
                {DateTime.fromJSDate(shop.updatedAt).toLocaleString(
                  DateTime.DATETIME_MED
                )}
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </div>
    );
  }
}
