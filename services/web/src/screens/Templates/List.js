import { Link } from '@bedrockio/router';

import ErrorMessage from 'components/ErrorMessage';
import PageHeader from 'components/PageHeader';
import Protected from 'components/Protected';
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

import Actions from './Actions';

export default function TemplateList() {
  async function onDataNeeded(body) {
    return await request({
      method: 'POST',
      path: '/1/templates/search',
      body,
    });
  }

  return (
    <Search.Provider onDataNeeded={onDataNeeded}>
      {({ items: templates, reload, error }) => {
        return (
          <div className="flex flex-col gap-4">
            <PageHeader
              title="Templates"
              breadcrumbItems={[
                { href: '/', title: 'Home' },
                { title: 'Templates' },
              ]}
              rightSection={
                <Protected endpoint="templates" permission="create">
                  <Button asChild>
                    <Link to="/templates/new">New Template</Link>
                  </Button>
                </Protected>
              }
            />

            <div className="flex items-center justify-between gap-4">
              <SearchFilters.Modal>
                <SearchFilters.Keyword name="keyword" label="Keyword" />
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
                  <Search.Header name="channels">Channels</Search.Header>
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
                        No templates found.
                      </p>
                    </TableCell>
                  </TableRow>
                </Search.EmptyMessage>
                {templates.map((template) => {
                  return (
                    <TableRow key={template.id}>
                      <TableCell>
                        <Link
                          className="text-foreground no-underline hover:underline"
                          to={`/templates/${template.id}`}>
                          {template.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {template.channels.map((channel) => {
                            return (
                              <Badge variant="secondary" key={channel}>
                                {channel}
                              </Badge>
                            );
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          <Actions
                            compact
                            template={template}
                            reload={reload}
                            displayMode="list"
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
