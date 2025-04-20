import { ActionIcon, Menu, Text, Group, Button } from '@mantine/core';
import { modals } from '@mantine/modals';

import {
  IconTrash,
  IconCode,
  IconPencil,
  IconDotsVertical,
  IconEdit,
  IconListSearch,
} from '@tabler/icons-react';
import { Link } from '@bedrockio/router';

import InspectObject from 'components/InspectObject';
import { request } from 'utils/api';
import ConfirmModal from 'components/ConfirmModal';
import Protected from 'components/Protected';

export default function ShopsActions({ shop, reload, compact }) {
  function openInspectModal() {
    modals.open({
      title: `Inspect ${shop.name}`,
      children: <InspectObject object={shop} name="shop" />,
      size: 'lg',
    });
  }

  function openDeleteModel() {
    modals.open({
      title: `Delete Shop`,
      children: (
        <ConfirmModal
          negative
          onConfirm={async () => {
            await request({
              method: 'DELETE',
              path: `/1/shops/${shop.id}`,
            });
            return reload();
          }}
          content={
            <Text>
              Are you sure you want to delete <strong>{shop.name}</strong>?
            </Text>
          }
          confirmButton="Delete"
        />
      ),
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
            to={`/shops/${shop.id}/edit`}>
            Edit
          </Button>
        ) : (
          <ActionIcon
            variant="default"
            component={Link}
            to={`/shops/${shop.id}/edit`}>
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
              to={`/audit-log?object=${shop.id}&filterLabel=${shop.name}`}
              leftSection={<IconListSearch size={14} />}>
              Audit Logs
            </Menu.Item>
          </Protected>

          <Protected endpoint="shops" permission="delete">
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
