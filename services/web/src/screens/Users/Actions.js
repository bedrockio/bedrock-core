import { ActionIcon, Group, Menu, Text, Button } from '@mantine/core';

import {
  PiCode,
  PiTrashFill,
  PiDotsThreeOutlineVerticalFill,
  PiPencilSimpleFill,
  PiKeyFill,
  PiRowsFill,
} from 'react-icons/pi';

import { Link } from '@bedrockio/router';
import { useSession } from 'stores/session';

import ConfirmModal from 'components/modals/Confirm';

import InspectObject from 'components/modals/InspectObject';
import { request } from 'utils/api';

import LoginAsUser from 'components/modals/LoginAsUser';
import Protected from 'components/Protected';
import ModalWrapper from 'components/ModalWrapper';

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
            <PiPencilSimpleFill />
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
            rightSection={<PiPencilSimpleFill />}
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
      <Protected endpoint="shops" permission="update">
        {renderButton()}
      </Protected>
      <Menu shadow="md" keepMounted>
        <Menu.Target>
          {displayMode !== 'list' ? (
            <ActionIcon variant="default">
              <PiDotsThreeOutlineVerticalFill />
            </ActionIcon>
          ) : (
            <ActionIcon variant="default">
              <PiDotsThreeOutlineVerticalFill />
            </ActionIcon>
          )}
        </Menu.Target>

        <Menu.Dropdown>
          <ModalWrapper
            title={`Login as ${user.name}`}
            component={<LoginAsUser user={user} />}
            size="lg"
            trigger={
              <Menu.Item
                disabled={!canAuthenticate}
                leftSection={<PiKeyFill />}>
                Login as User
              </Menu.Item>
            }
          />

          <Protected endpoint="auditEntries" permission="read">
            <Menu.Item
              component={Link}
              to={`/audit-log?user=${user.id}&filterLabel=${user.name}`}
              leftSection={<PiRowsFill />}>
              Audit Logs
            </Menu.Item>
          </Protected>

          <ModalWrapper
            title={`Inspect ${user.name}`}
            component={<InspectObject object={user} name="user" />}
            size="lg"
            trigger={<Menu.Item leftSection={<PiCode />}>Inspect</Menu.Item>}
          />
          <Protected endpoint="users" permission="delete">
            <ModalWrapper
              title="Delete User"
              trigger={
                <Menu.Item color="red" leftSection={<PiTrashFill />}>
                  Delete
                </Menu.Item>
              }
              component={
                <ConfirmModal
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
                />
              }
            />
          </Protected>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}
