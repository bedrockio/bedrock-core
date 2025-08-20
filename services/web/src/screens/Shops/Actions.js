import { Link } from '@bedrockio/router';
import { ActionIcon, Button, Group, Menu, Text } from '@mantine/core';

import {
  PiCode,
  PiDotsThreeOutlineVerticalFill,
  PiListMagnifyingGlass,
  PiPencilSimpleFill,
  PiTrashFill,
} from 'react-icons/pi';

import ModalWrapper from 'components/ModalWrapper';
import Protected from 'components/Protected';
import Confirm from 'components/modals/Confirm';
import InspectObject from 'components/modals/InspectObject';

import { request } from 'utils/api';

export default function ShopsActions({ shop, reload, displayMode = 'show' }) {
  function renderButton() {
    if (displayMode === 'list') {
      return (
        <Protected endpoint="shops" permission="update">
          <ActionIcon
            variant="default"
            component={Link}
            to={`/shops/${shop.id}/edit`}>
            <PiPencilSimpleFill />
          </ActionIcon>
        </Protected>
      );
    } else if (displayMode === 'edit') {
      return (
        <Button variant="default" component={Link} to={`/shops/${shop.id}`}>
          Back
        </Button>
      );
    } else if (displayMode === 'show') {
      return (
        <Protected endpoint="shops" permission="update">
          <Button
            variant="default"
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
            title="Inspect Shop"
            component={<InspectObject object={shop} name="shop" />}
            size="lg"
            trigger={<Menu.Item leftSection={<PiCode />}>Inspect</Menu.Item>}
          />
          <Protected endpoint="auditEntries" permission="read">
            <Menu.Item
              component={Link}
              to={`/audit-log?object=${shop.id}&filterLabel=${shop.name}`}
              leftSection={<PiListMagnifyingGlass />}>
              Audit Logs
            </Menu.Item>
          </Protected>

          <Protected endpoint="shops" permission="delete">
            <ModalWrapper
              title="Delete Shop"
              trigger={
                <Menu.Item color="red" leftSection={<PiTrashFill />}>
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
