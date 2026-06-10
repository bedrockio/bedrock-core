import { Link } from '@bedrockio/router';

import ErrorMessage from 'components/ErrorMessage';
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
import { formatRoles } from 'utils/permissions';
import { formatPhone } from 'utils/phone';

import Actions from './Actions';

export default function UserList() {
  async function onDataNeeded({ roles, ...body }) {
    return await request({
      method: 'POST',
      path: '/1/users/search',
      body: {
        ...body,
        roles: roles && {
          role: roles.map((role) => role.id || role),
        },
      },
    });
  }

  async function fetchRoles() {
    const { data } = await request({
      method: 'GET',
      path: `/1/users/roles`,
    });

    return { data };
  }

  return (
    <Search.Provider onDataNeeded={onDataNeeded}>
      {({ items: users, reload, error }) => {
        return (
          <div className="flex flex-col gap-4">
            <PageHeader
              title="Users"
              breadcrumbItems={[
                { href: '/', title: 'Home' },
                { title: 'Users' },
              ]}
              rightSection={
                <>
                  <Search.Export />
                  <Button asChild>
                    <Link to="/users/new">New User</Link>
                  </Button>
                </>
              }
            />

            <div className="flex items-center justify-between gap-4">
              <SearchFilters.Modal>
                <SearchFilters.Select
                  onDataNeeded={fetchRoles}
                  name="roles"
                  label="Roles"
                  multiple
                />
                <SearchFilters.DateRange label="Created At" name="createdAt" />
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
                  <Search.Header name="firstName" width={200}>
                    Name
                  </Search.Header>
                  <Search.Header name="email">Email</Search.Header>
                  <Search.Header name="phone">Phone</Search.Header>
                  <Search.Header name="roles">Role</Search.Header>
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
                    <TableCell colSpan={6}>
                      <p className="py-4 text-center font-bold">
                        No users found.
                      </p>
                    </TableCell>
                  </TableRow>
                </Search.EmptyMessage>
                {users.map((user) => {
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Link
                          className="text-foreground no-underline hover:underline"
                          to={`/users/${user.id}`}>
                          {user.name}
                        </Link>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{formatPhone(user.phone)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {formatRoles(user.roles).map((label) => {
                            return (
                              <Badge variant="secondary" key={label.key}>
                                <label.icon size={12} />
                                {label.content}
                              </Badge>
                            );
                          })}
                        </div>
                      </TableCell>
                      <TableCell>{formatDateTime(user.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          <Actions
                            displayMode="list"
                            user={user}
                            reload={reload}
                          />
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
