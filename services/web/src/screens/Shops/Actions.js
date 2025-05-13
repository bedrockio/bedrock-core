import { ActionIcon, Menu, Text, Group, Button } from '@mantine/core';

import {
  IconTrash,
  IconCode,
  IconPencil,
  IconDotsVertical,
  IconEdit,
  IconListSearch,
  IconArrowBack,
} from '@tabler/icons-react';
import { Link } from '@bedrockio/router';

import InspectObject from 'components/modals/InspectObject';
import { request } from 'utils/api';
import Confirm from 'components/modals/Confirm';
import Protected from 'components/Protected';
import ModalWrapper from 'components/ModalWrapper';

export default function ShopsActions({ shop, reload, displayMode = 'show' }) {
  function renderButton() {
    if (displayMode === 'list') {
      return (
        <Protected endpoint="shops" permission="update">
          <ActionIcon
            variant="default"
            component={Link}
            to={`/shops/${shop.id}/edit`}>
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
          to={`/shops/${shop.id}`}>
          Back
        </Button>
      );
    } else if (displayMode === 'show') {
      return (
        <Protected endpoint="shops" permission="update">
          <Button
            variant="default"
            rightSection={<IconPencil size={14} />}
            component={Link}
            to={`/shops/${shop.id}/edit`}>
            Edit
          </Button>
        </Protected>
      );
    }
  }

  return (
    <Group gap="xs" justify="flex-end">
      {renderButton()}
      <Menu keepMounted shadow="md">
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
            title="Inspect Shop"
            component={<InspectObject object={shop} name="shop" />}
            trigger={
              <Menu.Item leftSection={<IconCode size={14} />}>
                Inspect
              </Menu.Item>
            }
          />
          <Protected endpoint="auditEntries" permission="read">
            <Menu.Item
              component={Link}
              to={`/audit-log?object=${shop.id}&filterLabel=${shop.name}`}
              leftSection={<IconListSearch size={14} />}>
              Audit Logs
            </Menu.Item>
          </Protected>

          <Protected endpoint="shops" permission="delete">
            <ModalWrapper
              title="Delete Shop"
              trigger={
                <Menu.Item color="red" leftSection={<IconTrash size={14} />}>
                  Delete
                </Menu.Item>
              }
              component={
                <Confirm
                  negative
                  onConfirm={async () => {
                    await request({
                      method: 'DELETE',
                      path: `/1/shops/${shop.id}`,
                    });
                    reload();
                  }}
                  content={
                    <Text>
                      Are you sure you want to delete{' '}
                      <strong>{shop.name}</strong>?
                    </Text>
                  }
                  confirmButton="Delete"
                />
              }
            />
          </Protected>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}
