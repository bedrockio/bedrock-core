import { ActionIcon, Menu, Text } from '@mantine/core';
import { notifications, showNotification } from '@mantine/notifications';

import {
  PiDotsThreeOutlineVerticalBold,
  PiRepeatBold,
  PiTrashBold,
} from 'react-icons/pi';

import Confirm from 'modals/Confirm';

import { request, useRequest } from 'utils/api';

export default function InviteActions({ invite, reload }) {
  const resentRequest = useRequest({
    method: 'POST',
    path: `/1/invites/${invite.id}/resend`,
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
          <PiDotsThreeOutlineVerticalBold />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          onClick={() => {
            resentRequest.request();
          }}
          leftSection={<PiRepeatBold />}>
          Resend Invite
        </Menu.Item>

        <Confirm
          title="Delete Invite"
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
              Are you sure you want to delete <strong>{invite.email}</strong>?
            </Text>
          }
          trigger={
            <Menu.Item color="red" leftSection={<PiTrashBold />}>
              Delete
            </Menu.Item>
          }
        />
      </Menu.Dropdown>
    </Menu>
  );
}
