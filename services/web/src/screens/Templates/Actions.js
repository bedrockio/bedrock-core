import { Link } from '@bedrockio/router';
import { ActionIcon, Button, Group, Menu, Text } from '@mantine/core';

import {
  PiCode,
  PiDotsThreeOutlineVerticalBold,
  PiListMagnifyingGlass,
  PiPencilSimpleBold,
  PiTrashBold,
} from 'react-icons/pi';

import ModalWrapper from 'components/ModalWrapper';
import Protected from 'components/Protected';
import Confirm from 'modals/Confirm';
import InspectObject from 'modals/InspectObject';

import { request } from 'utils/api';

export default function TemplatesActions({
  template,
  reload,
  displayMode = 'show',
}) {
  function renderButton() {
    if (displayMode === 'list') {
      return (
        <Protected endpoint="templates" permission="update">
          <ActionIcon
            variant="default"
            component={Link}
            to={`/templates/${template.id}/edit`}>
            <PiPencilSimpleBold />
          </ActionIcon>
        </Protected>
      );
    } else if (displayMode === 'edit') {
      return (
        <Button
          variant="default"
          component={Link}
          to={`/templates/${template.id}`}>
          Back
        </Button>
      );
    } else if (displayMode === 'show') {
      return (
        <Protected endpoint="templates" permission="update">
          <Button
            variant="default"
            rightSection={<PiPencilSimpleBold />}
            component={Link}
            to={`/templates/${template.id}/edit`}>
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
            title="Inspect Template"
            object={template}
            trigger={<Menu.Item leftSection={<PiCode />}>Inspect</Menu.Item>}
          />
          <Protected endpoint="auditEntries" permission="read">
            <Menu.Item
              component={Link}
              to={`/audit-log?object=${template.id}&filterLabel=${template.name}`}
              leftSection={<PiListMagnifyingGlass />}>
              Audit Logs
            </Menu.Item>
          </Protected>

          <Protected endpoint="templates" permission="delete">
            <Confirm
              title="Delete Template"
              negative
              onConfirm={async () => {
                await request({
                  method: 'DELETE',
                  path: `/1/templates/${template.id}`,
                });
                reload();
              }}
              content={
                <Text>
                  Are you sure you want to delete{' '}
                  <strong>{template.name}</strong>?
                </Text>
              }
              confirmButton="Delete"
              trigger={
                <Menu.Item color="red" leftSection={<PiTrashBold />}>
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
