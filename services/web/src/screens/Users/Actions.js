import { ActionIcon, Group, Menu, Text, Button } from '@mantine/core';

import {
  IconDotsVertical,
  IconTrash,
  IconCode,
  IconPencil,
  IconUserCode,
  IconEdit,
  IconLogs,
  IconArrowBack,
} from '@tabler/icons-react';
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
            <IconEdit size={14} />
          </ActionIcon>
        </Protected>
      );
    } else if (displayMode === 'edit') {
      return (
        <Button
          variant="default"
          rightSection={<IconArrowBack size={14} />}
          component={Link}
          to={`/users/${user.id}`}>
          Back
        </Button>
      );
    } else if (displayMode === 'show') {
      return (
        <Protected endpoint="users" permission="update">
          <Button
            variant="default"
            rightSection={<IconPencil size={14} />}
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
            <ActionIcon size="input-sm" variant="default">
              <IconDotsVertical size={14} />
            </ActionIcon>
          ) : (
            <ActionIcon variant="default">
              <IconDotsVertical size={14} />
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
                leftSection={<IconUserCode size={14} />}>
                Login as User
              </Menu.Item>
            }
          />

          <Protected endpoint="auditEntries" permission="read">
            <Menu.Item
              component={Link}
              to={`/audit-log?user=${user.id}&filterLabel=${user.name}`}
              leftSection={<IconLogs size={14} />}>
              Audit Logs
            </Menu.Item>
          </Protected>

          <ModalWrapper
            title={`Inspect ${user.name}`}
            component={<InspectObject object={user} name="user" />}
            size="lg"
            trigger={
              <Menu.Item leftSection={<IconCode size={14} />}>
                Inspect
              </Menu.Item>
            }
          />
          <Protected endpoint="users" permission="delete">
            <ModalWrapper
              title="Delete User"
              trigger={
                <Menu.Item color="red" leftSection={<IconTrash size={14} />}>
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
