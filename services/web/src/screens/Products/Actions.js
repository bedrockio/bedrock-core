import { Link } from '@bedrockio/router';
import { ActionIcon, Button, Group, Menu, Text } from '@mantine/core';

import {
  PiCode,
  PiDotsThreeOutlineVerticalBold,
  PiListMagnifyingGlass,
  PiPencilSimpleBold,
} from 'react-icons/pi';

import ModalWrapper from 'components/ModalWrapper';
import Protected from 'components/Protected';
import Confirm from 'modals/Confirm';
import InspectObject from 'modals/InspectObject';

import { request } from 'utils/api';

export default function ProductsActions({
  product,
  reload,
  displayMode = 'show',
}) {
  function renderButton() {
    if (displayMode === 'list') {
      return (
        <Protected endpoint="products" permission="update">
          <ActionIcon
            variant="default"
            component={Link}
            to={`/products/${product.id}/edit`}>
            <PiPencilSimpleBold />
          </ActionIcon>
        </Protected>
      );
    } else if (displayMode === 'edit') {
      return (
        <Button
          variant="default"
          component={Link}
          to={`/products/${product.id}`}>
          Back
        </Button>
      );
    } else if (displayMode === 'show') {
      return (
        <Protected endpoint="users" permission="update">
          <Button
            variant="default"
            component={Link}
            to={`/products/${product.id}/edit`}>
            Edit
          </Button>
        </Protected>
      );
    }
  }

  return (
    <Group gap="xs" justify="flex-end">
      {renderButton()}
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
          <InspectObject
            title={`Inspect ${product.name}`}
            object={product}
            trigger={<Menu.Item leftSection={<PiCode />}>Inspect</Menu.Item>}
          />
          <Protected endpoint="auditEntries" permission="read">
            <Menu.Item
              component={Link}
              to={`/audit-log?object=${product.id}&filterLabel=${product.name}`}
              leftSection={<PiListMagnifyingGlass />}>
              Audit Logs
            </Menu.Item>
          </Protected>
          <Protected endpoint="products" permission="delete">
            <Confirm
              title="Delete Product"
              negative
              onConfirm={async () => {
                await request({
                  method: 'DELETE',
                  path: `/1/products/${product.id}`,
                });
                reload();
              }}
              content={
                <Text>
                  Are you sure you want to delete{' '}
                  <strong>{product.name}</strong>?
                </Text>
              }
              confirmButton="Delete"
              trigger={
                <Menu.Item color="red" leftSection={<PiListMagnifyingGlass />}>
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
