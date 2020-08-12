import React from 'react';
import { Header, Table, Loader, Image } from 'semantic-ui-react';
import { urlForUpload } from 'utils/uploads';
import { formatDateTime } from 'utils/date';
import { NotFound } from 'components';
import { screen } from 'helpers';
import Menu from './Menu';

@screen
export default class ShopOverview extends React.Component {
  render() {
    const { shop, error } = this.props;
    return (
      <React.Fragment>
        <Menu {...this.props} />
        {error ? (
          <NotFound message="Sorry that shop wasn't found." />
        ) : !shop ? (
          <Loader active>Loading</Loader>
        ) : (
          <React.Fragment>
            {/* --- Generator: overview */}
            <Header as="h1">{shop.name}</Header>
            <p>{shop.description}</p>
            <Header as="h3">Images</Header>
            <Image.Group size="large">
              {shop.images.map((image) => (
                <Image key={image.id} src={urlForUpload(image)} />
              ))}
            </Image.Group>
            {/* --- Generator */}
            <Header as="h3">Details</Header>
            <Table definition>
              <Table.Body>
                <Table.Row>
                  <Table.Cell>Created At</Table.Cell>
                  <Table.Cell>
                    {formatDateTime(shop.createdAt)}
                  </Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell>Updated At</Table.Cell>
                  <Table.Cell>
                    {formatDateTime(shop.updatedAt)}
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}
