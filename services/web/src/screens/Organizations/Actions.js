import { Link } from '@bedrockio/router';

import {
  PiCode,
  PiDotsThreeOutlineVerticalBold,
  PiListMagnifyingGlass,
  PiPencilSimpleBold,
  PiTrashBold,
} from 'react-icons/pi';

import Protected from 'components/Protected';
import Confirm from 'modals/Confirm';
import InspectObject from 'modals/InspectObject';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { request } from 'utils/api';

export default function OrganizationActions({
  displayMode = 'show',
  organization,
  reload,
}) {
  function renderButton() {
    if (displayMode === 'list') {
      return (
        <Protected endpoint="organizations" permission="update">
          <Button asChild variant="outline" size="icon">
            <Link to={`/organizations/${organization.id}/edit`}>
              <PiPencilSimpleBold />
            </Link>
          </Button>
        </Protected>
      );
    } else if (displayMode === 'edit') {
      return (
        <Button asChild variant="outline">
          <Link to={`/organizations/${organization.id}`}>Back</Link>
        </Button>
      );
    } else if (displayMode === 'show') {
      return (
        <Protected endpoint="organizations" permission="update">
          <Button asChild variant="outline">
            <Link to={`/organizations/${organization.id}/edit`}>Edit</Link>
          </Button>
        </Protected>
      );
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Protected endpoint="shops" permission="update">
        {renderButton()}
      </Protected>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <PiDotsThreeOutlineVerticalBold />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <InspectObject
            title={`Inspect ${organization.name}`}
            object={organization}
            trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <PiCode />
                Inspect
              </DropdownMenuItem>
            }
          />
          <Protected endpoint="auditEntries" permission="read">
            <DropdownMenuItem asChild>
              <Link
                to={`/audit-log?object=${organization.id}&filterLabel=${organization.name}`}>
                <PiListMagnifyingGlass />
                Audit Logs
              </Link>
            </DropdownMenuItem>
          </Protected>
          <Protected endpoint="organizations" permission="delete">
            <Confirm
              title="Delete Organization"
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
                <p className="text-sm">
                  Are you sure you want to delete{' '}
                  <strong>{organization.name}</strong>?
                </p>
              }
              trigger={
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={(e) => e.preventDefault()}>
                  <PiTrashBold />
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
