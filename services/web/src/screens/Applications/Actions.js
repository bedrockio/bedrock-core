import { ActionIcon, Menu, Text } from '@mantine/core';
import { modals } from '@mantine/modals';

import { IconDotsVertical, IconPencil, IconTrash } from '@tabler/icons-react';

import { request } from 'utils/api';
import ErrorMessage from 'components/ErrorMessage';
import { Link } from '@bedrockio/router';

export default function ApplicationActions({ application, reload }) {
  const openDeleteModel = () => {
    modals.openConfirmModal({
      title: `Remove Invite`,
      children: (
        <Text>
          Are you sure you want to remove <strong>{application.name}</strong>?
        </Text>
      ),
      labels: {
        cancel: 'Cancel',
        confirm: 'Remove Application',
      },
      confirmProps: {
        color: 'red',
      },
      onConfirm: async () => {
        try {
          await request({
            method: 'DELETE',
            path: `/1/applications/${application.id}`,
          });

          reload();
          modals.close();
        } catch (error) {
          modals.open({
            title: `Failed to delete application ${application.name}`,
            children: <ErrorMessage error={error} />,
          });
        }
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
          to={`/applications/${application.id}/edit`}
          leftSection={<IconPencil size={14} />}>
          Edit
        </Menu.Item>
        <Menu.Item
          onClick={openDeleteModel}
          color="red"
          leftSection={<IconTrash size={14} />}>
          Delete
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
