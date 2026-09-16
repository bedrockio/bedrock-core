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

export default function ProductsActions({
  product,
  reload,
  displayMode = 'show',
}) {
  // In edit mode the header only offers a way out — a close (✕), no row menu.
  if (displayMode === 'edit') {
    return <CloseButton to={`/products/${product.id}`} />;
  }

  function renderButton() {
    if (displayMode === 'list') {
      return (
        <Protected endpoint="products" permission="update">
          <Button asChild variant="outline" size="icon">
            <Link to={`/products/${product.id}/edit`}>
              <Pencil />
            </Link>
          </Button>
        </Protected>
      );
    } else if (displayMode === 'edit') {
      return (
        <Button asChild variant="outline">
          <Link to={`/products/${product.id}`}>Back</Link>
        </Button>
      );
    } else if (displayMode === 'show') {
      return (
        <Protected endpoint="users" permission="update">
          <Button asChild variant="outline">
            <Link to={`/products/${product.id}/edit`}>Edit</Link>
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
            title={`Inspect ${product.name}`}
            object={product}
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
                to={`/audit-log?object=${product.id}&filterLabel=${product.name}`}>
                <FileSearch />
                Audit Logs
              </Link>
            </DropdownMenuItem>
          </Protected>
          <Protected endpoint="products" permission="delete">
            <Confirm
              title="Delete Product"
              negative
              onConfirm={async () => {
                await request({
                  method: 'DELETE',
                  path: `/1/products/${product.id}`,
                });
                reload();
              }}
              content={
                <p className="text-sm">
                  Are you sure you want to delete{' '}
                  <strong>{product.name}</strong>?
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
