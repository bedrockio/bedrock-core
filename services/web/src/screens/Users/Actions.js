import { Link } from '@bedrockio/router';
import { ActionIcon, Button, Group, Menu, Text } from '@mantine/core';

import {
  PiCode,
  PiDotsThreeOutlineVerticalBold,
  PiKeyBold,
  PiPencilSimpleBold,
  PiRowsBold,
  PiTrashBold,
} from 'react-icons/pi';

import { useSession } from 'stores/session';

import Protected from 'components/Protected';
import Confirm from 'modals/Confirm';
import InspectObject from 'modals/InspectObject';
import LoginAsUser from 'modals/LoginAsUser';

import { request } from 'utils/api';

export default function UserActions({ displayMode = 'show', user, reload }) {
  const { user: authUser } = useSession();

  const authenticatableRoles = authUser.roles.reduce(
    (result, { roleDefinition }) =>
      result.concat(roleDefinition.allowAuthenticationOnRoles || []),
    [],
  );

  const canAuthenticate = [...user.roles].every(({ role }) =>
    authenticatableRoles.includes(role),
  );

  function renderButton() {
    if (displayMode === 'list') {
      return (
        <Protected endpoint="users" permission="update">
          <ActionIcon
            variant="default"
            component={Link}
            to={`/users/${user.id}/edit`}>
            <PiPencilSimpleBold />
          </ActionIcon>
        </Protected>
      );
    } else if (displayMode === 'edit') {
      return (
        <Button variant="default" component={Link} to={`/users/${user.id}`}>
          Back
        </Button>
      );
    } else if (displayMode === 'show') {
      return (
        <Protected endpoint="users" permission="update">
          <Button
            variant="default"
            component={Link}
            to={`/users/${user.id}/edit`}>
            Edit
          </Button>
        </Protected>
      );
    }
  }

  return (
    <Group gap="xs" justify="flex-end">
      <Protected endpoint="users" permission="update">
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
          <LoginAsUser
            title={`Login as ${user.name}`}
            user={user}
            trigger={
              <Menu.Item
                disabled={!canAuthenticate}
                leftSection={<PiKeyBold />}>
                Login as User
              </Menu.Item>
            }
          />

          <Protected endpoint="auditEntries" permission="read">
            <Menu.Item
              component={Link}
              to={`/audit-log?user=${user.id}&filterLabel=${user.name}`}
              leftSection={<PiRowsBold />}>
              Audit Logs
            </Menu.Item>
          </Protected>

          <InspectObject
            title={`Inspect ${user.name}`}
            object={user}
            trigger={<Menu.Item leftSection={<PiCode />}>Inspect</Menu.Item>}
          />
          <Protected endpoint="users" permission="delete">
            <Confirm
              title="Delete User"
              negative
              confirmButton="Delete"
              onConfirm={async () => {
                await request({
                  method: 'DELETE',
                  path: `/1/users/${user.id}`,
                });
                reload();
              }}
              content={
                <Text>
                  Are you sure you want to delete {user.name} ({user.email}
                  )?
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
