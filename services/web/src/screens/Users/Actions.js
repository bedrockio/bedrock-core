import { ActionIcon, Group, Menu, Text, Button } from '@mantine/core';
import { modals } from '@mantine/modals';

import {
  IconDotsVertical,
  IconTrash,
  IconCode,
  IconPencil,
  IconUserCode,
  IconEdit,
} from '@tabler/icons-react';
import { Link } from '@bedrockio/router';
import { useSession } from 'stores/session';

import InspectObject from 'components/InspectObject';
import { request } from 'utils/api';
import ErrorMessage from 'components/ErrorMessage';
import LoginAsUser from 'components/LoginAsUser';
import Protected from 'components/Protected';

export default function UserActions({ compact, user, reload }) {
  const { user: authUser } = useSession();

  const authenticatableRoles = authUser.roles.reduce(
    (result, { roleDefinition }) =>
      result.concat(roleDefinition.allowAuthenticationOnRoles || []),
    [],
  );

  const canAuthenticate = [...user.roles].every(({ role }) =>
    authenticatableRoles.includes(role),
  );

  const openLoginAsUserModal = () => {
    modals.open({
      title: `Login as ${user.name}`,
      children: <LoginAsUser user={user} />,
      size: 'lg',
    });
  };

  const openInspectModal = () => {
    modals.open({
      title: `Inspect ${user.name}`,
      children: <InspectObject object={user} name="user" />,
      size: 'lg',
    });
  };

  const openDeleteModel = () => {
    modals.openConfirmModal({
      title: `Delete User`,
      children: (
        <Text>
          Are you sure you want to delete <strong>{user.name}</strong>?
        </Text>
      ),
      labels: {
        cancel: 'Cancel',
        confirm: 'Delete User',
      },
      confirmProps: {
        color: 'red',
      },
      onConfirm: async () => {
        try {
          await request({
            method: 'DELETE',
            path: `/1/users/${user.id}`,
          });
          reload();
          modals.close();
        } catch (error) {
          modals.open({
            title: `Failed to delete user ${user.name}`,
            children: <ErrorMessage error={error} />,
          });
        }
      },
    });
  };

  return (
    <Group gap="xs" justify="flex-end">
      <Protected endpoint="shops" permission="update">
        {!compact ? (
          <Button
            variant="default"
            rightSection={<IconPencil size={14} />}
            component={Link}
            to={`/users/${user.id}/edit`}>
            Edit
          </Button>
        ) : (
          <ActionIcon
            variant="default"
            component={Link}
            to={`/users/${user.id}/edit`}>
            <IconEdit size={14} />
          </ActionIcon>
        )}
      </Protected>
      <Menu shadow="md">
        <Menu.Target>
          {!compact ? (
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
          <Menu.Item
            disabled={!canAuthenticate}
            onClick={() => openLoginAsUserModal()}
            leftSection={<IconUserCode size={14} />}>
            Login as User
          </Menu.Item>

          <Protected endpoint="auditEntries" permission="read">
            <Menu.Item
              component={Link}
              to={`/audit-log?object=${user.id}&filterLabel=${user.name}`}
              leftSection={<IconPencil size={14} />}>
              Audit Logs
            </Menu.Item>
          </Protected>

          <Menu.Item
            onClick={openInspectModal}
            leftSection={<IconCode size={14} />}>
            Inspect
          </Menu.Item>
          <Protected endpoint="users" permission="delete">
            <Menu.Item
              color="red"
              onClick={openDeleteModel}
              leftSection={<IconTrash size={14} />}>
              Delete
            </Menu.Item>
          </Protected>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}
