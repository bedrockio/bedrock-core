import { ActionIcon, Menu, Text, Group, Button } from '@mantine/core';
import {
  IconTrash,
  IconCode,
  IconPencil,
  IconDotsVertical,
  IconListSearch,
  IconArrowBack,
} from '@tabler/icons-react';
import { Link } from '@bedrockio/router';

import InspectObject from 'components/modals/InspectObject';
import ConfirmModal from 'components/modals/Confirm';
import Protected from 'components/Protected';
import { request } from 'utils/api';
import { IconEdit } from '@tabler/icons-react';
import ModalWrapper from 'components/ModalWrapper';

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
          to={`/products/${product.id}`}>
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
            <ActionIcon size="input-sm" variant="default">
              <IconDotsVertical size={20} />
            </ActionIcon>
          ) : (
            <ActionIcon variant="default">
              <IconDotsVertical size={20} />
            </ActionIcon>
          )}
        </Menu.Target>

        <Menu.Dropdown>
          <ModalWrapper
            title={`Inspect ${product.name}`}
            component={<InspectObject object={product} name="product" />}
            size="lg"
            trigger={
              <Menu.Item leftSection={<IconCode size={14} />}>
                Inspect
              </Menu.Item>
            }
          />
          <Protected endpoint="auditEntries" permission="read">
            <Menu.Item
              component={Link}
              to={`/audit-log?object=${product.id}&filterLabel=${product.name}`}
              leftSection={<IconListSearch size={14} />}>
              Audit Logs
            </Menu.Item>
          </Protected>
          <Protected endpoint="products" permission="delete">
            <ModalWrapper
              title="Delete Product"
              trigger={
                <Menu.Item color="red" leftSection={<IconTrash size={14} />}>
                  Delete
                </Menu.Item>
              }
              component={
                <ConfirmModal
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
                />
              }
            />
          </Protected>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}
