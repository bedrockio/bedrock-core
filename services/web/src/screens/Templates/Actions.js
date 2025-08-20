import { ActionIcon, Menu, Text, Group, Button } from '@mantine/core';

import {
  PiCode,
  PiPencilSimpleFill,
  PiTrashFill,
  PiListMagnifyingGlass,
  PiDotsThreeOutlineVerticalFill,
} from 'react-icons/pi';
import { Link } from '@bedrockio/router';

import InspectObject from 'components/modals/InspectObject';
import { request } from 'utils/api';
import Confirm from 'components/modals/Confirm';
import Protected from 'components/Protected';
import ModalWrapper from 'components/ModalWrapper';

export default function TemplatesActions({ template, reload, displayMode = 'show' }) {
  function renderButton() {
    if (displayMode === 'list') {
      return (
        <Protected endpoint="templates" permission="update">
          <ActionIcon
            variant="default"
            component={Link}
            to={`/templates/${template.id}/edit`}>
            <PiPencilSimpleFill />
          </ActionIcon>
        </Protected>
      );
    } else if (displayMode === 'edit') {
      return (
        <Button variant="default" component={Link} to={`/templates/${template.id}`}>
          Back
        </Button>
      );
    } else if (displayMode === 'show') {
      return (
        <Protected endpoint="templates" permission="update">
          <Button
            variant="default"
            rightSection={<PiPencilSimpleFill />}
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
            title="Inspect Template"
            component={<InspectObject object={template} name="template" />}
            size="lg"
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
            <ModalWrapper
              title="Delete Template"
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
                />
              }
            />
          </Protected>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}
