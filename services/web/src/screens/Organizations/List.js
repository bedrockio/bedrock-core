import { Link } from '@bedrockio/router';

import ErrorMessage from 'components/ErrorMessage';
import PageHeader from 'components/PageHeader';
import Search from 'components/Search';
import SearchFilters from 'components/Search/Filters';

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

export default function OrganizationList() {
  async function onDataNeeded(body) {
    return await request({
      method: 'POST',
      path: '/1/organizations/search',
      body,
    });
  }

  return (
    <Search.Provider onDataNeeded={onDataNeeded}>
      {({ items: organizations, reload, error }) => (
        <div className="flex flex-col gap-4">
          <PageHeader
            title="Organizations"
            breadcrumbItems={[
              { href: '/', title: 'Home' },
              { title: 'Organizations' },
            ]}
            rightSection={
              <Button asChild>
                <Link to="/organizations/new">New Organization</Link>
              </Button>
            }
          />

          <div className="flex items-center justify-between gap-4">
            <SearchFilters.Modal>
              <SearchFilters.DateRange
                time
                name="createdAt"
                label="Created At"
              />
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
                <Search.Header name="name">Name</Search.Header>
                <Search.Header name="createdAt" width={280}>
                  Created
                </Search.Header>
                <Search.Header width={100} className="text-center">
                  Actions
                </Search.Header>
              </TableRow>
            </TableHeader>
            <TableBody>
              <Search.EmptyMessage>
                <TableRow>
                  <TableCell colSpan={3}>
                    <p className="py-4 text-center font-bold">
                      No organization found.
                    </p>
                  </TableCell>
                </TableRow>
              </Search.EmptyMessage>
              {organizations.map((organization) => (
                <TableRow key={organization.id}>
                  <TableCell>
                    <Link
                      className="text-foreground no-underline hover:underline"
                      to={`/organizations/${organization.id}`}>
                      {organization.name}
                    </Link>
                  </TableCell>
                  <TableCell>{formatDateTime(organization.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <Actions
                        displayMode="list"
                        organization={organization}
                        reload={reload}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Search.Pagination />
        </div>
      )}
    </Search.Provider>
  );
}
