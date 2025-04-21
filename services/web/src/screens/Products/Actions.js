import { ActionIcon, Menu, Text, Group, Button } from '@mantine/core';
import { modals } from '@mantine/modals';
import {
  IconTrash,
  IconCode,
  IconPencil,
  IconDotsVertical,
  IconListSearch,
} from '@tabler/icons-react';
import { Link } from '@bedrockio/router';

import InspectObject from 'components/InspectObject';
import ConfirmModal from 'components/ConfirmModal';
import Protected from 'components/Protected';
import { request } from 'utils/api';
import { IconEdit } from '@tabler/icons-react';

export default function ProductsActions({ product, reload, compact }) {
  function openInspectModal() {
    modals.open({
      title: `Inspect ${product.name}`,
      children: <InspectObject object={product} name="product" />,
      size: 'lg',
    });
  }

  function openDeleteModel() {
    modals.open({
      title: `Delete Product`,
      children: (
        <ConfirmModal
          negative
          onConfirm={async () => {
            await request({
              method: 'DELETE',
              path: `/1/products/${product.id}`,
            });
            return reload();
          }}
          content={
            <Text>
              Are you sure you want to delete <strong>{product.name}</strong>?
            </Text>
          }
          confirmButton="Delete"
        />
      ),
    });
  }

  return (
    <Group gap="xs" justify="flex-end">
      <Protected endpoint="products" permission="update">
        {!compact ? (
          <Button
            variant="default"
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
          {!compact ? (
            <ActionIcon size="input-sm" variant="default">
              <IconDotsVertical size={20} />
            </ActionIcon>
          ) : (
            <ActionIcon variant="default">
              <IconDotsVertical size={20} />
            </ActionIcon>
          )}
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item
            onClick={openInspectModal}
            leftSection={<IconCode size={14} />}>
            Inspect
          </Menu.Item>
          <Protected endpoint="auditEntries" permission="read">
            <Menu.Item
              component={Link}
              to={`/audit-log?object=${product.id}&filterLabel=${product.name}`}
              leftSection={<IconListSearch size={14} />}>
              Audit Logs
            </Menu.Item>
          </Protected>
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
