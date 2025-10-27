import { Link } from '@bedrockio/router';
import { ActionIcon, Menu, Text } from '@mantine/core';

import {
  PiDotsThreeOutlineVerticalBold,
  PiPencilSimpleBold,
  PiTrashBold,
} from 'react-icons/pi';

import Confirm from 'modals/Confirm';

import { request } from 'utils/api';

export default function ApplicationActions({ application, reload }) {
  return (
    <Menu shadow="md" keepMounted>
      <Menu.Target>
        <ActionIcon variant="default">
          <PiDotsThreeOutlineVerticalBold />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          component={Link}
          to={`/applications/${application.id}/edit`}
          leftSection={<PiPencilSimpleBold />}>
          Edit
        </Menu.Item>
        <Confirm
          title="Delete Application"
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
