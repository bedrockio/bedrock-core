import { ActionIcon, Menu, Text } from '@mantine/core';

import {
  PiTrashFill,
  PiPencilSimpleFill,
  PiDotsThreeOutlineVerticalFill,
} from 'react-icons/pi';
import { request } from 'utils/api';
import ConfirmModal from 'components/modals/Confirm';
import { Link } from '@bedrockio/router';
import ModalWrapper from 'components/ModalWrapper';

export default function ApplicationActions({ application, reload }) {
  return (
    <Menu shadow="md" keepMounted>
      <Menu.Target>
        <ActionIcon variant="default">
          <PiDotsThreeOutlineVerticalFill />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          component={Link}
          to={`/applications/${application.id}/edit`}
          leftSection={<PiPencilSimpleFill />}>
          Edit
        </Menu.Item>
        <ModalWrapper
          title="Delete Application"
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
