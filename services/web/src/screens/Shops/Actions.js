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

export default function ShopsActions({ shop, reload, displayMode = 'show' }) {
  function renderButton() {
    if (displayMode === 'list') {
      return (
        <Protected endpoint="shops" permission="update">
          <Button asChild variant="outline" size="icon">
            <Link to={`/shops/${shop.id}/edit`}>
              <PiPencilSimpleBold />
            </Link>
          </Button>
        </Protected>
      );
    } else if (displayMode === 'edit') {
      return (
        <Button asChild variant="outline">
          <Link to={`/shops/${shop.id}`}>Back</Link>
        </Button>
      );
    } else if (displayMode === 'show') {
      return (
        <Protected endpoint="shops" permission="update">
          <Button asChild variant="outline">
            <Link to={`/shops/${shop.id}/edit`}>Edit</Link>
          </Button>
        </Protected>
      );
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {renderButton()}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <PiDotsThreeOutlineVerticalBold />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <InspectObject
            title="Inspect Shop"
            object={shop}
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
                to={`/audit-log?object=${shop.id}&filterLabel=${shop.name}`}>
                <PiListMagnifyingGlass />
                Audit Logs
              </Link>
            </DropdownMenuItem>
          </Protected>

          <Protected endpoint="shops" permission="delete">
            <Confirm
              title="Delete Shop"
              negative
              onConfirm={async () => {
                await request({
                  method: 'DELETE',
                  path: `/1/shops/${shop.id}`,
                });
                reload();
              }}
              content={
                <p className="text-sm">
                  Are you sure you want to delete <strong>{shop.name}</strong>?
                </p>
              }
              confirmButton="Delete"
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
