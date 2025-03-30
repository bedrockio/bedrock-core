import { ActionIcon, Menu, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';

import { IconDotsVertical, IconTrash, IconRepeat } from '@tabler/icons-react';

import { request, useRequest } from 'utils/api';
import ErrorMessage from 'components/ErrorMessage';

import { notifications } from '@mantine/notifications';

export default function InviteActions({ invite, reload }) {
  const resentRequest = useRequest({
    method: 'POST',
    path: `/1/invites/${invite.id}/resend`,
    manual: true,
    onSuccess: () => {
      showNotification({
        position: 'top-center',
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

  const openDeleteModel = () => {
    modals.openConfirmModal({
      title: `Remove Invite`,
      children: (
        <Text>
          Are you sure you want to remove <strong>{invite.email}</strong>?
        </Text>
      ),
      labels: {
        cancel: 'Cancel',
        confirm: 'Remove Invite',
      },
      confirmProps: {
        color: 'red',
      },
      onConfirm: async () => {
        try {
          await request({
            method: 'DELETE',
            path: `/1/invites/${invite.id}`,
          });
          reload();
          modals.close();
        } catch (error) {
          modals.open({
            title: `Failed to delete user ${invite.name}`,
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
