import { useEffect, useState } from 'react';

import { debounce } from 'lodash';
import { Check, ChevronsUpDown, LayoutGrid } from 'lucide-react';

import { useSession } from 'stores/session';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

import { request } from 'utils/api';
import { getOrganization, setOrganization } from 'utils/organization';
import { userHasAccess } from 'utils/permissions';

function OrgIcon({ name }) {
  if (!name) {
    return (
      <span className="bg-muted text-muted-foreground grid size-6 shrink-0 place-items-center rounded">
        <LayoutGrid className="size-3.5" />
      </span>
    );
  }
  return (
    <span className="bg-primary/10 text-primary grid size-6 shrink-0 place-items-center rounded text-xs font-semibold uppercase">
      {name[0]}
    </span>
  );
}

export default function OrganizationSelector() {
  const { user, organization } = useSession();

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const hasGlobal = userHasAccess(user, {
    endpoint: 'organizations',
    permission: 'read',
    scope: 'global',
  });

  async function fetchOrganizations(body = {}) {
    setLoading(true);
    try {
      const { data } = await request({
        method: 'POST',
        path: hasGlobal
          ? '/1/organizations/search'
          : '/1/organizations/mine/search',
        body,
      });
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) {
      fetchOrganizations();
    }
  }, [open]);

  const onSearchChange = debounce((keyword) => {
    fetchOrganizations(keyword ? { keyword } : {});
  }, 200);

  function onSelect(id) {
    setOpen(false);
    if (id !== getOrganization()) {
      setOrganization(id);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start gap-2 font-medium">
          <OrgIcon name={organization?.name} />
          <span className="flex-1 truncate text-left">
            {organization?.name || 'All Organizations'}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search organizations..."
            onValueChange={onSearchChange}
          />
          <CommandList>
            {hasGlobal && (
              <>
                <CommandGroup>
                  <CommandItem
                    value="__all__"
                    onSelect={() => onSelect(null)}>
                    <OrgIcon />
                    <span className="flex-1">All Organizations</span>
                    {!organization && <Check className="size-3.5" />}
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
              </>
            )}
            <CommandGroup heading="Organizations">
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Spinner className="size-4" />
                </div>
              ) : (
                <CommandEmpty>No organizations found</CommandEmpty>
              )}
              {!loading &&
                items.map((org) => {
                  const isSelected = organization?.id === org.id;
                  return (
                    <CommandItem
                      key={org.id}
                      value={org.id}
                      onSelect={() => onSelect(org.id)}>
                      <OrgIcon name={org.name} />
                      <span
                        className={cn(
                          'flex-1 truncate',
                          isSelected && 'font-medium',
                        )}>
                        {org.name}
                      </span>
                      {isSelected && <Check className="size-3.5" />}
                    </CommandItem>
                  );
                })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
