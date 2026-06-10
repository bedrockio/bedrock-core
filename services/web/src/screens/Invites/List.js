import ErrorMessage from 'components/ErrorMessage';
import ModalWrapper from 'components/ModalWrapper';
import PageHeader from 'components/PageHeader';
import Search from 'components/Search';
import SearchFilters from 'components/Search/Filters';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { request } from 'utils/api';
import { formatDateTime } from 'utils/date';

import Actions from './Actions';
import InviteForm from './Form';

export default function Invites() {
  async function onDataNeeded(params) {
    return await request({
      method: 'POST',
      path: '/1/invites/search',
      body: params,
    });
  }

  return (
    <Search.Provider onDataNeeded={onDataNeeded}>
      {({ items, reload, error }) => {
        return (
          <div className="flex flex-col gap-4">
            <PageHeader
              title="Invites"
              breadcrumbItems={[
                { href: '/', title: 'Home' },
                { title: 'Invites' },
              ]}
              rightSection={
                <ModalWrapper
                  title="Invite Users"
                  size="md"
                  component={<InviteForm onSuccess={reload} />}
                  trigger={<Button>Invite User</Button>}
                />
              }
            />

            <div className="flex items-center justify-between gap-4">
              <SearchFilters.Modal>
                <SearchFilters.Select
                  name="status"
                  label="Status"
                  data={[
                    { value: 'invited', label: 'Invited' },
                    { value: 'accepted', label: 'Accepted' },
                  ]}
                />
                <SearchFilters.DateRange name="createdAt" label="Created At" />
              </SearchFilters.Modal>

              <div className="flex items-center gap-4">
                <Search.Status />
                <SearchFilters.Keyword />
              </div>
            </div>

            <ErrorMessage error={error} />

            <Table>
              <TableHeader>
                <TableRow>
                  <Search.Header>Email</Search.Header>
                  <Search.Header name="status">Status</Search.Header>
                  <Search.Header name="createdAt" width={280}>
                    Invited At
                  </Search.Header>
                  <Search.Header width={60} className="text-center">
                    Actions
                  </Search.Header>
                </TableRow>
              </TableHeader>
              <TableBody>
                <Search.EmptyMessage>
                  <TableRow>
                    <TableCell colSpan={4}>
                      <p className="py-4 text-center font-bold">
                        No invites found.
                      </p>
                    </TableCell>
                  </TableRow>
                </Search.EmptyMessage>
                {items.map((item) => {
                  return (
                    <TableRow key={item.id}>
                      <TableCell>{item.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.status}</Badge>
                      </TableCell>
                      <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          <Actions invite={item} reload={reload} />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <Search.Pagination />
          </div>
        );
      }}
    </Search.Provider>
  );
}
