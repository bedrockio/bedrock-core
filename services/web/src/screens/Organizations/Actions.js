import { ActionIcon, Menu, Text, Button, Group } from '@mantine/core';
import { modals } from '@mantine/modals';
import {
  IconTrash,
  IconCode,
  IconListSearch,
  IconDotsVertical,
  IconPencil,
  IconEdit,
} from '@tabler/icons-react';
import { Link } from '@bedrockio/router';

import ErrorMessage from 'components/ErrorMessage';
import InspectObject from 'components/InspectObject';
import Protected from 'components/Protected';
import { request } from 'utils/api';

export default function OrganizationActions({ compact, organization, reload }) {
  function openInspectModal() {
    modals.open({
      title: `Inspect ${organization.name}`,
      children: <InspectObject object={organization} name="organization" />,
      size: 'lg',
    });
  }

  function openDeleteModal() {
    modals.openConfirmModal({
      title: `Delete Organization`,
      children: (
        <Text>
          Are you sure you want to delete <strong>{organization.name}</strong>?
        </Text>
      ),
      labels: { cancel: 'Cancel', confirm: 'Delete' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await request({
            method: 'DELETE',
            path: `/1/organizations/${organization.id}`,
          });
          reload();
          modals.close();
        } catch (error) {
          modals.open({
            title: `Failed to delete organization ${organization.name}`,
            children: <ErrorMessage error={error} />,
          });
        }
      },
    });
  }

  return (
    <Group gap="xs" justify="flex-end">
      <Protected endpoint="shops" permission="update">
        {!compact ? (
          <Button
            variant="default"
            rightSection={<IconPencil size={14} />}
            component={Link}
            to={`/organizations/${organization.id}/edit`}>
            Edit
          </Button>
        ) : (
          <ActionIcon
            variant="default"
            component={Link}
            to={`/organizations/${organization.id}/edit`}>
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
            onClick={openInspectModal}
            leftSection={<IconCode size={14} />}>
            Inspect
          </Menu.Item>
          <Protected endpoint="auditEntries" permission="read">
            <Menu.Item
              component={Link}
              to={`/audit-log?object=${organization.id}&filterLabel=${organization.name}`}
              leftSection={<IconListSearch size={14} />}>
              Audit Logs
            </Menu.Item>
          </Protected>
          <Protected endpoint="organizations" permission="delete">
            <Menu.Item
              color="red"
              onClick={openDeleteModal}
              leftSection={<IconTrash size={14} />}>
              Delete
            </Menu.Item>
          </Protected>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}
