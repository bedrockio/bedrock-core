import { Button, Menu, Text } from '@mantine/core';
import { modals } from '@mantine/modals';

import {
  IconChevronDown,
  IconTrash,
  IconCode,
  IconPencil,
} from '@tabler/icons-react';
import { Link } from '@bedrockio/router';

import InspectObject from 'components/InspectObject';
import { request } from 'utils/api';
import ErrorMessage from 'components/ErrorMessage';

export default function ShopsActions({ shop, reload }) {
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
    <Menu shadow="md">
      <Menu.Target>
        <Button variant="default" rightSection={<IconChevronDown size={14} />}>
          More
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          component={Link}
          to={`/shops/${shop.id}/edit`}
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
