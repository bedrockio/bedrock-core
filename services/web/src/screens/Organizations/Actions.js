import { ActionIcon, Menu, Text, Button, Group } from '@mantine/core';

import {
  PiCode,
  PiPencilSimpleFill,
  PiTrashFill,
  PiListMagnifyingGlass,
  PiDotsThreeOutlineVerticalFill,
  PiArrowUUpLeft,
  PiPencil,
} from 'react-icons/pi';

import { Link } from '@bedrockio/router';

import InspectObject from 'components/modals/InspectObject';
import ConfirmModal from 'components/modals/Confirm';
import Protected from 'components/Protected';
import { request } from 'utils/api';
import ModalWrapper from 'components/ModalWrapper';

export default function OrganizationActions({
  displayMode = 'show',
  organization,
  reload,
}) {
  function renderButton() {
    if (displayMode === 'list') {
      return (
        <Protected endpoint="organizations" permission="update">
          <ActionIcon
            variant="default"
            component={Link}
            to={`/organizations/${organization.id}/edit`}>
            <PiPencilSimpleFill />
          </ActionIcon>
        </Protected>
      );
    } else if (displayMode === 'edit') {
      return (
        <Button
          variant="default"
          rightSection={<PiArrowUUpLeft />}
          component={Link}
          to={`/organizations/${organization.id}`}>
          Back
        </Button>
      );
    } else if (displayMode === 'show') {
      return (
        <Protected endpoint="organizations" permission="update">
          <Button
            variant="default"
            rightSection={<PiPencil />}
            component={Link}
            to={`/organizations/${organization.id}/edit`}>
            Edit
          </Button>
        </Protected>
      );
    }
  }

  return (
    <Group gap="xs" justify="flex-end">
      <Protected endpoint="shops" permission="update">
        {renderButton()}
      </Protected>
      <Menu shadow="md" keepMounted>
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
            title={`Inspect ${organization.name}`}
            component={
              <InspectObject object={organization} name="organization" />
            }
            size="lg"
            trigger={<Menu.Item leftSection={<PiCode />}>Inspect</Menu.Item>}
          />
          <Protected endpoint="auditEntries" permission="read">
            <Menu.Item
              component={Link}
              to={`/audit-log?object=${organization.id}&filterLabel=${organization.name}`}
              leftSection={<PiListMagnifyingGlass />}>
              Audit Logs
            </Menu.Item>
          </Protected>
          <Protected endpoint="organizations" permission="delete">
            <ModalWrapper
              title="Delete Organization"
              trigger={
                <Menu.Item color="red" leftSection={<PiTrashFill />}>
                  Delete
                </Menu.Item>
              }
              component={
                <ConfirmModal
                  negative
                  onConfirm={async () => {
                    await request({
                      method: 'DELETE',
                      path: `/1/organizations/${organization.id}`,
                    });
                    reload();
                  }}
                  confirmButton="Delete"
                  content={
                    <Text>
                      Are you sure you want to delete{' '}
                      <strong>{organization.name}</strong>?
                    </Text>
                  }
                />
              }
            />
          </Protected>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}
