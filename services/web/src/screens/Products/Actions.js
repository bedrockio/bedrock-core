import { ActionIcon, Menu, Text, Group, Button } from '@mantine/core';
import { modals } from '@mantine/modals';
import {
  IconTrash,
  IconCode,
  IconPencil,
  IconDotsVertical,
} from '@tabler/icons-react';
import { Link } from '@bedrockio/router';

import ErrorMessage from 'components/ErrorMessage';
import InspectObject from 'components/InspectObject';
import Protected from 'components/Protected';
import { request } from 'utils/api';
import { IconEdit } from '@tabler/icons-react';

export default function ProductsActions({ product, reload, compact }) {
  const openInspectModal = () => {
    modals.open({
      title: `Inspect ${product.name}`,
      children: <InspectObject object={product} name="product" />,
      size: 'lg',
    });
  };

  const openDeleteModel = () => {
    modals.openConfirmModal({
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
      confirmProps: {
        color: 'red',
      },
      onConfirm: async () => {
        try {
          await request({
            method: 'DELETE',
            path: `/1/products/${product.id}`,
          });
          reload();
          modals.close();
        } catch (error) {
          modals.open({
            title: `Failed to delete shop ${product.name}`,
            children: <ErrorMessage error={error} />,
          });
        }
      },
    });
  };

  return (
    <Group gap="xs" justify="flex-end">
      <Protected endpoint="products" permission="update">
        {!compact ? (
          <Button
            variant="default"
            size="xs"
            leftSection={<IconPencil size={14} />}
            component={Link}
            to={`/products/${product.id}/edit`}>
            Edit
          </Button>
        ) : (
          <ActionIcon
            variant="default"
            component={Link}
            to={`/products/${product.id}/edit`}>
            <IconEdit size={14} />
          </ActionIcon>
        )}
      </Protected>
      <Menu shadow="md">
        <Menu.Target>
          <ActionIcon variant="default">
            <IconDotsVertical size={20} />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item
            onClick={openInspectModal}
            leftSection={<IconCode size={14} />}>
            Inspect
          </Menu.Item>
          <Protected endpoint="products" permission="delete">
            <Menu.Item
              color="red"
              onClick={openDeleteModel}
              leftSection={<IconTrash size={14} />}>
              Delete
            </Menu.Item>
          </Protected>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}
