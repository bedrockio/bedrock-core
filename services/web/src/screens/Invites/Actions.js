import { ActionIcon, Menu, Text } from '@mantine/core';
import { notifications, showNotification } from '@mantine/notifications';

import {
  PiDotsThreeOutlineVerticalFill,
  PiRepeatFill,
  PiTrashFill,
} from 'react-icons/pi';

import ModalWrapper from 'components/ModalWrapper';
import ConfirmModal from 'components/modals/Confirm';

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
          <PiDotsThreeOutlineVerticalFill />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          onClick={() => {
            resentRequest.request();
          }}
          leftSection={<PiRepeatFill />}>
          Resend Invite
        </Menu.Item>

        <ModalWrapper
          title="Delete Invite"
          trigger={
            <Menu.Item color="red" leftSection={<PiTrashFill />}>
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
