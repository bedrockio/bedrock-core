import { ActionIcon, Menu, Text } from '@mantine/core';
import { modals } from '@mantine/modals';

import { IconDotsVertical, IconPencil, IconTrash } from '@tabler/icons-react';

import { request } from 'utils/api';
import ConfirmModal from 'components/ConfirmModal';
import { Link } from '@bedrockio/router';

export default function ApplicationActions({ application, reload }) {
  function openDeleteModel() {
    modals.open({
      title: 'Delete Application',
      children: (
        <ConfirmModal
          negative
          onConfirm={async () => {
            await request({
              method: 'DELETE',
              path: `/1/applications/${application.id}`,
            });
            return reload();
          }}
          confirmButton="Delete"
          content={
            <Text>
              Are you sure you want to delete{' '}
              <strong>{application.name}</strong>?
            </Text>
          }
        />
      ),
    });
  }

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
