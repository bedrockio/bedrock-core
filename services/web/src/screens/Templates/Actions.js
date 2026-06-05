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

export default function TemplatesActions(props) {
  const { template, reload } = props;

  return (
    <div className="flex items-center justify-end gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <PiDotsThreeOutlineVerticalBold />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <InspectObject
            title="Inspect Template"
            object={template}
            trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <PiCode />
                Inspect
              </DropdownMenuItem>
            }
          />
          <Protected endpoint="templates" permission="update">
            <DropdownMenuItem asChild>
              <Link to={`/templates/${template.id}/edit`}>
                <PiPencilSimpleBold />
                Edit
              </Link>
            </DropdownMenuItem>
          </Protected>
          <Protected endpoint="auditEntries" permission="read">
            <DropdownMenuItem asChild>
              <Link
                to={`/audit-log?object=${template.id}&filterLabel=${template.name}`}>
                <PiListMagnifyingGlass />
                Audit Logs
              </Link>
            </DropdownMenuItem>
          </Protected>

          <Protected endpoint="templates" permission="delete">
            <Confirm
              title="Delete Template"
              negative
              onConfirm={async () => {
                await request({
                  method: 'DELETE',
                  path: `/1/templates/${template.id}`,
                });
                reload();
              }}
              content={
                <p className="text-sm">
                  Are you sure you want to delete{' '}
                  <strong>{template.name}</strong>?
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
