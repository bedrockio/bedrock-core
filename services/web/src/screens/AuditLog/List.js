import { Link } from '@bedrockio/router';
import { Search as SearchIcon } from 'lucide-react';
import { useState } from 'react';

import Meta from 'components/Meta';
import PageHeader from 'components/PageHeader';
import Search from 'components/Search';
import SearchFilters from 'components/Search/Filters';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { request } from 'utils/api';
import { formatDateTime } from 'utils/date';

import Overview from './Details/Overview';

export default function AuditLogList() {
  const [selectedItem, setSelectedItem] = useState(null);

  async function onDataNeeded(params) {
    const response = await request({
      method: 'POST',
      path: '/1/audit-entries/search',
      body: {
        ...params,
        include: ['actor'],
      },
    });

    const store = {};

    (response.data || []).forEach((item) => {
      if (!item.ownerId || !item.ownerType) return;
      const list = store[item.ownerType] || [];
      list.push(item.ownerId);
      store[item.ownerType] = list;
    });

    // its split here because the owner could be a user or another collection
    const [users] = await Promise.all(
      Object.keys(store)
        .map((key) => {
          if (key === 'User') {
            const ids = [...new Set(store[key])];
            if (!ids.length) return null;
            return fetchUsers({
              ids,
              include: ['name', 'firstName', 'lastName', 'email'],
            });
          }
          // eslint-disable-next-line no-console
          console.error('[AuditLog] Unknown ownerType', key);
          return null;
        })
        .filter(Boolean),
    );

    response.data.forEach((item) => {
      if (item.ownerType === 'User') {
        const user = users?.find((u) => u.id === item.ownerId);
        if (!user) return;
        item.owner = user;
      }
    });

    return response;
  }

  async function fetchUsers(props) {
    const { data } = await request({
      method: 'POST',
      path: '/1/users/search',
      body: props,
    });
    return data;
  }

  async function fetchSearchOptions(props) {
    const { data } = await request({
      method: 'POST',
      path: '/1/audit-entries/search-options',
      body: props,
    });
    return data;
  }

  return (
    <>
      <Meta title="Audit Log" />
      <Sheet
        open={!!selectedItem}
        onOpenChange={(open) => {
          if (!open) setSelectedItem(null);
        }}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Audit Entry: {selectedItem?.activity}</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto px-4 pb-4">
            {selectedItem && <Overview auditEntry={selectedItem} />}
          </div>
        </SheetContent>
      </Sheet>

      <Search.UrlProvider onDataNeeded={onDataNeeded}>
        {({ items }) => (
          <div className="flex flex-col gap-4">
            <PageHeader
              title="Audit Log"
              breadcrumbItems={[
                { href: '/', title: 'Home' },
                { title: 'Audit Log' },
              ]}
            />

            <div className="flex items-center justify-between gap-4">
              <SearchFilters.Modal>
                <SearchFilters.Search
                  onDataNeeded={fetchUsers}
                  name="actor"
                  label="Actor"
                />
                <SearchFilters.Search
                  onDataNeeded={fetchUsers}
                  name="ownerId"
                  label="Owner"
                />
                <SearchFilters.Search
                  onDataNeeded={() => fetchSearchOptions({ field: 'activity' })}
                  name="activity"
                  label="Activity"
                />
                <SearchFilters.Search
                  name="objectType"
                  label="Object Type"
                  onDataNeeded={() =>
                    fetchSearchOptions({ field: 'objectType' })
                  }
                />
                <SearchFilters.Input name="sessionId" label="Session Id" />
                <SearchFilters.Input name="object" label="Object Id" />
                <SearchFilters.DateRange label="Created At" name="createdAt" />
              </SearchFilters.Modal>

              <Search.Status />
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <Search.Header name="actor">Actor</Search.Header>
                  <Search.Header name="activity">Activity</Search.Header>
                  <Search.Header>Object Owner</Search.Header>
                  <Search.Header>Object Name</Search.Header>
                  <Search.Header name="createdAt" width={170}>
                    Date
                  </Search.Header>
                  <Search.Header className="text-center">Actions</Search.Header>
                </TableRow>
              </TableHeader>
              <TableBody>
                <Search.EmptyMessage>
                  <TableRow>
                    <TableCell colSpan={6}>
                      <p className="py-4 text-center font-bold">
                        No entries found.
                      </p>
                    </TableCell>
                  </TableRow>
                </Search.EmptyMessage>
                {items.map((item) => {
                  const name = item.object?.name || item.actor?.name || '';
                  return (
                    <TableRow
                      key={item.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedItem(item)}>
                      <TableCell>
                        {item.actor && (
                          <Link
                            className="text-foreground no-underline hover:underline"
                            title={item.actor.email}
                            to={`/users/${item.actor.id}`}
                            onClick={(e) => e.stopPropagation()}>
                            {item.actor.firstName} {item.actor.lastName}
                          </Link>
                        )}
                      </TableCell>
                      <TableCell>{item.activity}</TableCell>
                      <TableCell>
                        {item.owner && (
                          <Link
                            className="text-foreground no-underline hover:underline"
                            title={item.owner.email}
                            to={`/users/${item.owner.id}`}
                            onClick={(e) => e.stopPropagation()}>
                            {item.owner.name}
                          </Link>
                        )}
                      </TableCell>
                      <TableCell>{name}</TableCell>
                      <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={(evt) => {
                              evt.stopPropagation();
                              setSelectedItem(item);
                            }}>
                            <SearchIcon className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <Search.Pagination />
          </div>
        )}
      </Search.UrlProvider>
    </>
  );
}
