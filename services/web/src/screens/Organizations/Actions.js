import { Link } from '@bedrockio/router';
import { ActionIcon, Button, Group, Menu, Text } from '@mantine/core';

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

export default function OrganizationActions({
  displayMode = 'show',
  organization,
  reload,
}) {
  function renderButton() {
    if (displayMode === 'list') {
      return (
        <Protected endpoint="organizations" permission="update">
          <ActionIcon
            variant="default"
            component={Link}
            to={`/organizations/${organization.id}/edit`}>
            <PiPencilSimpleBold />
          </ActionIcon>
        </Protected>
      );
    } else if (displayMode === 'edit') {
      return (
        <Button
          variant="default"
          component={Link}
          to={`/organizations/${organization.id}`}>
          Back
        </Button>
      );
    } else if (displayMode === 'show') {
      return (
        <Protected endpoint="organizations" permission="update">
          <Button
            variant="default"
            component={Link}
            to={`/organizations/${organization.id}/edit`}>
            Edit
          </Button>
        </Protected>
      );
    }
  }

  return (
    <Group gap="xs" justify="flex-end">
      <Protected endpoint="shops" permission="update">
        {renderButton()}
      </Protected>
      <Menu shadow="md" keepMounted>
        <Menu.Target>
          {displayMode !== 'list' ? (
            <ActionIcon variant="default">
              <PiDotsThreeOutlineVerticalBold />
            </ActionIcon>
          ) : (
            <ActionIcon variant="default">
              <PiDotsThreeOutlineVerticalBold />
            </ActionIcon>
          )}
        </Menu.Target>

        <Menu.Dropdown>
          <InspectObject
            title={`Inspect ${organization.name}`}
            object={organization}
            trigger={<Menu.Item leftSection={<PiCode />}>Inspect</Menu.Item>}
          />
          <Protected endpoint="auditEntries" permission="read">
            <Menu.Item
              component={Link}
              to={`/audit-log?object=${organization.id}&filterLabel=${organization.name}`}
              leftSection={<PiListMagnifyingGlass />}>
              Audit Logs
            </Menu.Item>
          </Protected>
          <Protected endpoint="organizations" permission="delete">
            <Confirm
              title="Delete Organization"
              negative
              onConfirm={async () => {
                await request({
                  method: 'DELETE',
                  path: `/1/organizations/${organization.id}`,
                });
                reload();
              }}
              confirmButton="Delete"
              content={
                <Text>
                  Are you sure you want to delete{' '}
                  <strong>{organization.name}</strong>?
                </Text>
              }
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
