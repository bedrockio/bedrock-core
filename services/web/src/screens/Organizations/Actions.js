import { ActionIcon, Menu, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import {
  IconTrash,
  IconCode,
  IconPencil,
  IconDotsVertical,
} from '@tabler/icons-react';
import { Link } from '@bedrockio/router';

import ErrorMessage from 'components/ErrorMessage';
import InspectObject from 'components/InspectObject';
import { request } from 'utils/api';

export default function OrganizationActions({ organization, reload }) {
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
    <Menu shadow="md">
      <Menu.Target>
        <ActionIcon variant="default">
          <IconDotsVertical size={20} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          component={Link}
          to={`/organizations/${organization.id}/edit`}
          leftSection={<IconPencil size={14} />}>
          Edit
        </Menu.Item>
        <Menu.Item
          onClick={openInspectModal}
          leftSection={<IconCode size={14} />}>
          Inspect
        </Menu.Item>
        <Menu.Item
          color="red"
          onClick={openDeleteModal}
          leftSection={<IconTrash size={14} />}>
          Delete
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
