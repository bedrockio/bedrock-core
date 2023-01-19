import React from 'react';
import { Dropdown } from 'semantic';

import { request } from 'utils/api';
import InspectObject from 'modals/InspectObject';
import { Confirm } from 'components';

import LoginAsUser from 'modals/LoginAsUser';
import { useSession } from 'stores/session';

export default function UserActions({ item, reload } = {}) {
  const { user } = useSession();

  const authenticatableRoles = user.roles.reduce(
    (result, { roleDefinition }) =>
      result.concat(roleDefinition.allowAuthenticationOnRoles || []),
    []
  );

  const canAuthenticate = [...item.roles].every(({ role }) =>
    authenticatableRoles.includes(role)
  );

  return (
    <Dropdown button basic text="More">
      <Dropdown.Menu direction="left">
        <LoginAsUser
          size="tiny"
          user={item}
          trigger={
            <Dropdown.Item
              disabled={!canAuthenticate}
              icon="user-secret"
              text="Login as User"
            />
          }
        />

        <InspectObject
          name="Shop"
          object={item}
          trigger={<Dropdown.Item text="Inspect" icon="code" />}
        />
        <Confirm
          negative
          confirmButton="Delete"
          header={`Are you sure you want to delete "${item.name}"?`}
          content="All data will be permanently deleted"
          trigger={<Dropdown.Item text="Delete" icon="trash" />}
          onConfirm={async () => {
            await request({
              method: 'DELETE',
              path: `/1/users/${item.id}`,
            });
            reload();
          }}
        />
      </Dropdown.Menu>
    </Dropdown>
  );
}
