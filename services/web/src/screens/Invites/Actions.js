import { ActionIcon, Menu, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';

import { IconDotsVertical, IconTrash, IconRepeat } from '@tabler/icons-react';

import { request, useRequest } from 'utils/api';
import ConfirmModal from 'components/ConfirmModal';
import { notifications } from '@mantine/notifications';

export default function InviteActions({ invite, reload }) {
  const resentRequest = useRequest({
    method: 'POST',
    path: `/1/invites/${invite.id}/resend`,
    manual: true,
    onSuccess: () => {
      showNotification({
        title: 'Invite re-sent',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Failed to re-send invite',
        message: error.message,
        color: 'red',
      });
    },
  });

  function openDeleteModel() {
    modals.open({
      title: `Delete Invite`,
      children: (
        <ConfirmModal
          negative
          onConfirm={async () => {
            await request({
              method: 'DELETE',
              path: `/1/invites/${invite.id}`,
            });
            return reload();
          }}
          confirmButton="Delete"
          content={
            <Text>
              Are you sure you want to delete <strong>{invite.email}</strong>?
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
          onClick={() => {
            resentRequest.request();
          }}
          leftSection={<IconRepeat size={14} />}>
          Resend Invite
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
