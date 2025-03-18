import React from 'react';
import { Table, Title, Image, Paper, Anchor } from '@mantine/core';

import { usePage } from 'stores/page';
import Meta from 'components/Meta';

import { Header } from 'semantic';
import { arrayToList, formatAddress } from 'utils/formatting';

import { formatDateTime } from 'utils/date';
import { urlForUpload } from 'utils/uploads';

import Menu from './Menu';

const items = [
  { title: 'Shops', href: '/shops' },
  { title: 'Settings', href: '/settings' },
].map((item, index) => (
  <Anchor href={item.href} key={index}>
    {item.title}
  </Anchor>
));

export default function ShopOverview() {
  const { shop } = usePage();
  return (
    <React.Fragment>
      <PageHeader title="Edit Shop" breadcrumbItems={items} />

      <Meta title={shop.name} />
      <Menu />

      {/* --- Generator: overview-fields */}
      <p>{shop.description}</p>
      <Title as="h3">Images</Title>

      <Paper>
        {shop.images.map((image) => (
          <Image key={image} src={urlForUpload(image)} />
        ))}
      </Paper>

      <Table variant="vertical" layout="fixed">
        <Table.Tbody>
          <Table.Tr>
            <Table.Td>Categories</Table.Td>
            <Table.Td>{arrayToList(shop.categories)}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Address</Table.Td>
            <Table.Td>{formatAddress(shop.address)}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Created At</Table.Td>
            <Table.Td>{formatDateTime(shop.createdAt)}</Table.Td>
          </Table.Tr>
          <Table.Tr>
            <Table.Td>Updated At</Table.Td>
            <Table.Td>{formatDateTime(shop.updatedAt)}</Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </React.Fragment>
  );
}
