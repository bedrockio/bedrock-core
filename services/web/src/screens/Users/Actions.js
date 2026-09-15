import { Link, useNavigate } from '@bedrockio/router';

import {
  Code,
  EllipsisVertical,
  Key,
  Pencil,
  Rows3,
  Trash2,
} from 'lucide-react';

import { showSuccessNotification } from 'helpers/notifications';
import { useSession } from 'stores/session';

import Protected from 'components/Protected';
import Confirm from 'modals/Confirm';
import InspectObject from 'modals/InspectObject';
import LoginAsUser from 'modals/LoginAsUser';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { request } from 'utils/api';

export default function UserActions(props) {
  const { displayMode = 'show', user, reload } = props;
  const { user: authUser } = useSession();

  const navigate = useNavigate();

  const authenticatableRoles = authUser.roles.reduce(
    (result, { roleDefinition }) =>
      result.concat(roleDefinition.allowAuthenticationOnRoles || []),
    [],
  );

  const canAuthenticate = [...user.roles].every(({ role }) =>
    authenticatableRoles.includes(role),
  );

  function renderButton() {
    if (displayMode === 'list') {
      return (
        <Protected endpoint="users" permission="update">
          <Button asChild variant="outline" size="icon">
            <Link to={`/users/${user.id}/edit`}>
              <Pencil />
            </Link>
          </Button>
        </Protected>
      );
    } else if (displayMode === 'edit') {
      return (
        <Button asChild variant="outline">
          <Link to={`/users/${user.id}`}>Back</Link>
        </Button>
      );
    } else if (displayMode === 'show') {
      return (
        <Protected endpoint="users" permission="update">
          <Button asChild variant="outline">
            <Link to={`/users/${user.id}/edit`}>Edit</Link>
          </Button>
        </Protected>
      );
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Protected endpoint="users" permission="update">
        {renderButton()}
      </Protected>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <LoginAsUser
            title={`Login as ${user.name}`}
            user={user}
            trigger={
              <DropdownMenuItem
                disabled={!canAuthenticate}
                onSelect={(e) => e.preventDefault()}>
                <Key />
                Login as User
              </DropdownMenuItem>
            }
          />

          <Protected endpoint="auditEntries" permission="read">
            <DropdownMenuItem asChild>
              <Link to={`/audit-log?user=${user.id}&filterLabel=${user.name}`}>
                <Rows3 />
                Audit Logs
              </Link>
            </DropdownMenuItem>
          </Protected>

          <InspectObject
            title={`Inspect ${user.name}`}
            object={user}
            trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Code />
                Inspect
              </DropdownMenuItem>
            }
          />
          <Protected endpoint="users" permission="delete">
            <Confirm
              title="Delete User"
              negative
              confirmButton="Delete"
              onConfirm={async () => {
                await request({
                  method: 'DELETE',
                  path: `/1/users/${user.id}`,
                });
                if (displayMode === 'list') {
                  reload();
                } else {
                  navigate('/users');
                }
                showSuccessNotification({
                  message: 'User Deleted',
                });
              }}
              content={
                <p className="text-sm">
                  Are you sure you want to delete {user.name} ({user.email})?
                </p>
              }
              trigger={
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={(e) => e.preventDefault()}>
                  <Trash2 />
                  Delete
                </DropdownMenuItem>
              }
            />
          </Protected>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
