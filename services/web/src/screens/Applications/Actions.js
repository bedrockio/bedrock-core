import { Link } from '@bedrockio/router';

import {
  PiDotsThreeOutlineVerticalBold,
  PiPencilSimpleBold,
  PiTrashBold,
} from 'react-icons/pi';

import Confirm from 'modals/Confirm';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { request } from 'utils/api';

export default function ApplicationActions({ application, reload }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <PiDotsThreeOutlineVerticalBold />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Link to={`/applications/${application.id}/edit`}>
            <PiPencilSimpleBold />
            Edit
          </Link>
        </DropdownMenuItem>
        <Confirm
          title="Delete Application"
          negative
          onConfirm={async () => {
            await request({
              method: 'DELETE',
              path: `/1/applications/${application.id}`,
            });
            reload();
          }}
          confirmButton="Delete"
          content={
            <p className="text-sm">
              Are you sure you want to delete{' '}
              <strong>{application.name}</strong>?
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
