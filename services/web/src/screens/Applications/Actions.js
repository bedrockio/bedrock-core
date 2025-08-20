import { ActionIcon, Menu, Text } from '@mantine/core';

import { IconDotsVertical, IconPencil, IconTrash } from '@tabler/icons-react';

import { request } from 'utils/api';
import ConfirmModal from 'components/modals/Confirm';
import { Link } from '@bedrockio/router';
import ModalWrapper from 'components/ModalWrapper';

export default function ApplicationActions({ application, reload }) {
  return (
    <Menu shadow="md" keepMounted>
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
        <ModalWrapper
          title="Delete Application"
          trigger={
            <Menu.Item color="red" leftSection={<IconTrash size={14} />}>
              Delete
            </Menu.Item>
          }
          component={
            <ConfirmModal
              negative
              onConfirm={async () => {
                await request({
                  method: 'DELETE',
                  path: `/1/applications/${application.id}`,
                });
                reload();
              }}
              confirmButton="Delete"
              content={
                <Text>
                  Are you sure you want to delete{' '}
                  <strong>{application.name}</strong>?
                </Text>
              }
            />
          }
        />
      </Menu.Dropdown>
    </Menu>
  );
}
