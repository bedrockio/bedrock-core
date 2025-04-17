import { ActionIcon, Menu, Text, Group, Button } from '@mantine/core';
import { modals } from '@mantine/modals';

import {
  IconTrash,
  IconCode,
  IconPencil,
  IconDotsVertical,
  IconEdit,
} from '@tabler/icons-react';
import { Link } from '@bedrockio/router';

import InspectObject from 'components/InspectObject';
import { request } from 'utils/api';
import ErrorMessage from 'components/ErrorMessage';
import Protected from 'components/Protected';

export default function ShopsActions({ shop, reload, compact }) {
  const openInspectModal = () => {
    modals.open({
      title: `Inspect ${shop.name}`,
      children: <InspectObject object={shop} name="shop" />,
      size: 'lg',
    });
  };

  const openDeleteModel = () => {
    modals.openConfirmModal({
      title: `Delete Shop`,
      children: (
        <Text>
          Are you sure you want to delete <strong>{shop.name}</strong>?
        </Text>
      ),
      labels: {
        cancel: 'Cancel',
        confirm: 'Delete Shope',
      },
      confirmProps: {
        color: 'red',
      },
      onConfirm: async () => {
        try {
          await request({
            method: 'DELETE',
            path: `/1/shops/${shop.id}`,
          });
          reload();
          modals.close();
        } catch (error) {
          modals.open({
            title: `Failed to delete shop ${shop.name}`,
            children: <ErrorMessage error={error} />,
          });
        }
      },
    });
  };

  return (
    <Group gap="xs" justify="flex-end">
      <Protected permission="shops.update">
        {!compact ? (
          <Button
            variant="default"
            size="xs"
            leftSection={<IconPencil size={14} />}
            component={Link}
            to={`/shops/${shop.id}/edit`}>
            Edit
          </Button>
        ) : (
          <ActionIcon
            variant="default"
            component={Link}
            to={`/shops/${shop.id}/edit`}>
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

          <Protected permission="shops.delete">
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
