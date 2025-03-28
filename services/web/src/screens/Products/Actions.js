import { ActionIcon, Menu, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import {
  IconTrash,
  IconCode,
  IconPencil,
  IconDotsVertical,
} from '@tabler/icons-react';
import { Link } from '@bedrockio/router';

import InspectObject from 'components/InspectObject';
import { request } from 'utils/api';

export default function ProductsActions({ product, reload }) {
  const openInspectModal = () => {
    modals.open({
      title: `Inspect ${product.name}`,
      children: <InspectObject object={product} name="product" />,
      size: 'lg',
    });
  };

  const openDeleteModel = () => {
    modals.open({
      title: `Delete Product`,
      children: (
        <Text>
          Are you sure you want to delete <strong>{product.name}</strong>?
        </Text>
      ),
      labels: {
        cancel: 'Cancel',
        confirm: 'Delete',
      },
      onConfirm: async () => {
        await request({
          method: 'DELETE',
          path: `/1/products/${product.id}`,
        });
        reload();
        modals.close();
      },
    });
  };

  return (
    <Menu shadow="md">
      <Menu.Target>
        <ActionIcon variant="default">
          <IconDotsVertical size={20} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          component={Link}
          to={`/products/${product.id}/edit`}
          leftSection={<IconPencil size={14} />}>
          Edit
        </Menu.Item>

        <Menu.Item
          onClick={openInspectModal}
          leftSection={<IconCode size={14} />}>
          Inspect
        </Menu.Item>

        <Menu.Item
          onClick={openDeleteModel}
          leftSection={<IconTrash size={14} />}>
          Delete
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
