import { Link } from '@bedrockio/router';

import Meta from 'components/Meta';
import PageHeader from 'components/PageHeader';
import Search from 'components/Search';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { request } from 'utils/api';
import { fromNow } from 'utils/date';

import Actions from './Actions';

export default function Applications() {
  const onDataNeeded = async (body) => {
    return await request({
      method: 'POST',
      path: '/1/applications/search',
      body,
    });
  };

  return (
    <>
      <Meta title="Applications" />
      <Search.Provider onDataNeeded={onDataNeeded}>
        {({ items, reload }) => {
          return (
            <div className="flex flex-col gap-4">
              <PageHeader
                title="Applications"
                breadcrumbItems={[
                  { href: '/', title: 'Home' },
                  { title: 'Applications' },
                ]}
                rightSection={
                  <Button asChild>
                    <Link to="/applications/new">New Application</Link>
                  </Button>
                }
              />

              <Table>
                <TableHeader>
                  <TableRow>
                    <Search.Header name="name">Name</Search.Header>
                    <Search.Header className="w-1/4">Description</Search.Header>
                    <Search.Header>APIKey</Search.Header>
                    <Search.Header>Last Used</Search.Header>
                    <Search.Header width={100} className="text-center">
                      Actions
                    </Search.Header>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    return (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>
                          <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">
                            {item.apiKey}
                          </code>
                        </TableCell>
                        <TableCell>
                          {item.lastUsedAt ? fromNow(item.lastUsedAt) : 'N / A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <Actions
                              displayMode="list"
                              application={item}
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
    </>
  );
}
