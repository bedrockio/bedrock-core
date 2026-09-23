import { Link } from '@bedrockio/router';

import ErrorMessage from 'components/ErrorMessage';
import ListStats from 'components/ListStats';
import ListToolbar from 'components/ListToolbar';
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
                  <Search.Export filename="users" />
                  <Button asChild>
                    <Link to="/users/new">New User</Link>
                  </Button>
                </>
              }
            />

            <ListStats resource="users" label="Users" />

            <ListToolbar>
              <SearchFilters.Select
                onDataNeeded={fetchRoles}
                name="roles"
                label="Roles"
                multiple
              />
              <SearchFilters.DateRange label="Created At" name="createdAt" />
            </ListToolbar>

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
                <Search.Loading columns={6} />
                <Search.EmptyMessage>
                  <TableRow>
                    <TableCell colSpan={6}>
                      <div className="text-muted-foreground flex flex-col items-center gap-1 py-12 text-center">
                        <p className="text-foreground font-semibold">
                          No users found
                        </p>
                        <p className="text-sm">
                          Invite a teammate, or adjust your filters.
                        </p>
                      </div>
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
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {formatDateTime(user.createdAt)}
                      </TableCell>
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
