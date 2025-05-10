import { ActionIcon, Menu, Text } from '@mantine/core';
import { showNotification } from '@mantine/notifications';

import { IconDotsVertical, IconTrash, IconRepeat } from '@tabler/icons-react';

import { request, useRequest } from 'utils/api';
import ConfirmModal from 'components/modals/Confirm';
import { notifications } from '@mantine/notifications';
import ModalWrapper from 'components/ModalWrapper';

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

  return (
    <Menu shadow="md" keepMounted>
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

        <ModalWrapper
          title="Delete Invite"
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
                  path: `/1/invites/${invite.id}`,
                });
                reload();
              }}
              confirmButton="Delete"
              content={
                <Text>
                  Are you sure you want to delete{' '}
                  <strong>{invite.email}</strong>?
                </Text>
              }
            />
          }
        />
      </Menu.Dropdown>
    </Menu>
  );
}
