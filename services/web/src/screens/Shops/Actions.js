import { Button, Menu, Text } from '@mantine/core';

import InspectObject from 'components/InspectObject';

import { modals } from '@mantine/modals';

import { IconChevronDown, IconTrash, IconCode } from '@tabler/icons-react';

import { request } from 'utils/api';

export default function ShopsActions({ shop, reload }) {
  return (
    <Menu shadow="md">
      <Menu.Target>
        <Button variant="default" rightSection={<IconChevronDown size={14} />}>
          More
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          onClick={() =>
            modals.open({
              title: `Inspect ${shop.name}`,
              children: <InspectObject object={shop} name="shop" />,
              size: 'lg',
            })
          }
          leftSection={<IconCode size={14} />}>
          Inspect
        </Menu.Item>

        <Menu.Item
          onClick={() =>
            modals.openConfirmModal({
              title: `Delete shop`,
              children: (
                <Text size="sm">
                  Are you sure you want to delete {shop.name}. This action is
                  destructive and you will have to contact support to restore
                  your data
                </Text>
              ),
              labels: {
                confirm: 'Delete',
                cancel: 'Cancel',
              },
              confirmProps: { color: 'red' },
              size: 'lg',
              confirmButton: 'Delete',
              onConfirm: async () => {
                await request({
                  method: 'DELETE',
                  path: `/1/shops/${shop.id}`,
                });
                reload();
              },
            })
          }
          leftSection={<IconTrash size={14} />}>
          Delete
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
