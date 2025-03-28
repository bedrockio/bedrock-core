import { ActionIcon, Menu, Text } from '@mantine/core';
import { modals } from '@mantine/modals';

import {
  IconDotsVertical,
  IconTrash,
  IconCode,
  IconPencil,
  IconUserCode,
} from '@tabler/icons-react';
import { Link } from '@bedrockio/router';
import { useSession } from 'stores/session';

import InspectObject from 'components/InspectObject';
import { request } from 'utils/api';
import ErrorMessage from 'components/ErrorMessage';
import LoginAsUser from 'components/LoginAsUser';

export default function UserActions({ user, reload }) {
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
    <Menu shadow="md">
      <Menu.Target>
        <ActionIcon variant="default">
          <IconDotsVertical size={20} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          disabled={!canAuthenticate}
          onClick={() => openLoginAsUserModal()}
          leftSection={<IconUserCode size={14} />}>
          Login as User
        </Menu.Item>

        <Menu.Item
          component={Link}
          to={`/users/${user.id}/edit`}
          leftSection={<IconPencil size={14} />}>
          Edit
        </Menu.Item>

        <Menu.Item
          onClick={openInspectModal}
          leftSection={<IconCode size={14} />}>
          Inspect
        </Menu.Item>

        <Menu.Item
          onClick={openDeleteModel}
          leftSection={<IconTrash size={14} />}>
          Delete
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
