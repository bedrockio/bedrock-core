import { Link } from '@bedrockio/router';

import {
  Code,
  EllipsisVertical,
  FileSearch,
  Pencil,
  Trash2,
} from 'lucide-react';

import CloseButton from 'components/CloseButton';
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
  // In edit mode the header only offers a way out — a close (✕), no row menu.
  if (displayMode === 'edit') {
    return <CloseButton to={`/shops/${shop.id}`} />;
  }

  function renderButton() {
    if (displayMode === 'list') {
      return (
        <Protected endpoint="shops" permission="update">
          <Button asChild variant="outline" size="icon">
            <Link to={`/shops/${shop.id}/edit`}>
              <Pencil />
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
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <InspectObject
            title="Inspect Shop"
            object={shop}
            trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Code />
                Inspect
              </DropdownMenuItem>
            }
          />
          <Protected endpoint="auditEntries" permission="read">
            <DropdownMenuItem asChild>
              <Link
                to={`/audit-log?object=${shop.id}&filterLabel=${shop.name}`}>
                <FileSearch />
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
