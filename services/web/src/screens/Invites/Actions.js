import {
  PiDotsThreeOutlineVerticalBold,
  PiRepeatBold,
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

import { request, useRequest } from 'utils/api';
import { notify } from 'utils/notify';

export default function InviteActions({ invite, reload }) {
  const resentRequest = useRequest({
    method: 'POST',
    path: `/1/invites/${invite.id}/resend`,
    onSuccess: () => {
      notify({
        title: 'Invite re-sent',
        color: 'green',
      });
    },
    onError: (error) => {
      notify({
        title: 'Failed to re-send invite',
        message: error.message,
        color: 'red',
      });
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <PiDotsThreeOutlineVerticalBold />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem
          onSelect={() => {
            resentRequest.request();
          }}>
          <PiRepeatBold />
          Resend Invite
        </DropdownMenuItem>

        <Confirm
          title="Delete Invite"
          negative
          onConfirm={async () => {
            await request({
              method: 'DELETE',
              path: `/1/invites/${invite.id}`,
            });
            reload();
          }}
          confirmButton="Delete"
          content={
            <p className="text-sm">
              Are you sure you want to delete <strong>{invite.email}</strong>?
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
