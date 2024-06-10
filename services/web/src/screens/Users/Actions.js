import { Dropdown } from 'semantic';

import { useSession } from 'stores/session';

import InspectObject from 'modals/InspectObject';
import LoginAsUser from 'modals/LoginAsUser';
import Confirm from 'components/Confirm';

import { request } from 'utils/api';

export default function UserActions(props) {
  const { user, reload } = props;
  const { user: authUser } = useSession();

  const authenticatableRoles = authUser.roles.reduce(
    (result, { roleDefinition }) =>
      result.concat(roleDefinition.allowAuthenticationOnRoles || []),
    []
  );

  const canAuthenticate = [...user.roles].every(({ role }) =>
    authenticatableRoles.includes(role)
  );

  return (
    <Dropdown button basic text="More">
      <Dropdown.Menu direction="left">
        <LoginAsUser
          size="tiny"
          user={user}
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
          object={user}
          trigger={<Dropdown.Item text="Inspect" icon="code" />}
        />
        <Confirm
          negative
          confirmButton="Delete"
          header={`Are you sure you want to delete "${user.name}"?`}
          content="All data will be permanently deleted"
          trigger={<Dropdown.Item text="Delete" icon="trash" />}
          onConfirm={async () => {
            await request({
              method: 'DELETE',
              path: `/1/users/${user.id}`,
            });
            reload();
          }}
        />
      </Dropdown.Menu>
    </Dropdown>
  );
}
