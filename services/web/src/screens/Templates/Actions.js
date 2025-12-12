import { Link } from '@bedrockio/router';
import { ActionIcon, Group, Menu, Text } from '@mantine/core';

import {
  PiCode,
  PiDotsThreeOutlineVerticalBold,
  PiListMagnifyingGlass,
  PiPencilSimpleBold,
  PiTrashBold,
} from 'react-icons/pi';

import Protected from 'components/Protected';
import Confirm from 'modals/Confirm';
import InspectObject from 'modals/InspectObject';

import { request } from 'utils/api';

export default function TemplatesActions(props) {
  const { template, reload } = props;

  return (
    <Group gap="xs" justify="flex-end">
      <Menu keepMounted shadow="md">
        <Menu.Target>
          <ActionIcon variant="default">
            <PiDotsThreeOutlineVerticalBold />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <InspectObject
            title="Inspect Template"
            object={template}
            trigger={<Menu.Item leftSection={<PiCode />}>Inspect</Menu.Item>}
          />
          <Protected endpoint="templates" permission="update">
            <Menu.Item
              component={Link}
              to={`/templates/${template.id}/edit`}
              leftSection={<PiPencilSimpleBold />}>
              Edit
            </Menu.Item>
          </Protected>
          <Protected endpoint="auditEntries" permission="read">
            <Menu.Item
              component={Link}
              to={`/audit-log?object=${template.id}&filterLabel=${template.name}`}
              leftSection={<PiListMagnifyingGlass />}>
              Audit Logs
            </Menu.Item>
          </Protected>

          <Protected endpoint="templates" permission="delete">
            <Confirm
              title="Delete Template"
              negative
              onConfirm={async () => {
                await request({
                  method: 'DELETE',
                  path: `/1/templates/${template.id}`,
                });
                reload();
              }}
              content={
                <Text>
                  Are you sure you want to delete{' '}
                  <strong>{template.name}</strong>?
                </Text>
              }
              confirmButton="Delete"
              trigger={
                <Menu.Item color="red" leftSection={<PiTrashBold />}>
                  Delete
                </Menu.Item>
              }
            />
          </Protected>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}
