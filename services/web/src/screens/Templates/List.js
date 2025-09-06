import { Link } from '@bedrockio/router';

import {
  Anchor,
  Badge,
  Button,
  Group,
  Loader,
  Stack,
  Table,
  Text,
} from '@mantine/core';

import ErrorMessage from 'components/ErrorMessage';
import PageHeader from 'components/PageHeader';
import Protected from 'components/Protected';
import Search from 'components/Search';
import SearchFilters from 'components/Search/Filters';
import SortableTh from 'components/Table/SortableTh';

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

  function getFilterMapping() {
    return {
      subject: {
        label: 'Subject',
      },
      keyword: {},
    };
  }

  return (
    <>
      <Search.Provider
        onDataNeeded={onDataNeeded}
        filterMapping={getFilterMapping()}>
        {({ items: templates, getSorted, setSort, reload, error, loading }) => {
          return (
            <Stack>
              <PageHeader
                title="Templates"
                breadcrumbItems={[
                  {
                    href: '/',
                    title: 'Home',
                  },
                  {
                    title: 'Templates',
                  },
                ]}
                rightSection={
                  <>
                    <Protected endpoint="templates" permission="create">
                      <Button
                        component={Link}
                        variant="default"
                        to="/templates/new">
                        New Template
                      </Button>
                    </Protected>
                  </>
                }
              />

              <Group justify="space-between">
                <SearchFilters.Modal>
                  <SearchFilters.Keyword name="keyword" label="Keyword" />
                </SearchFilters.Modal>
                {loading && <Loader size={'sm'} />}

                <Group>
                  <Search.Total />
                  <SearchFilters.Keyword />
                </Group>
              </Group>

              <ErrorMessage error={error} />

              <Table.ScrollContainer>
                <Table stickyHeader striped>
                  <Table.Thead>
                    <Table.Tr>
                      <SortableTh
                        sorted={getSorted('name')}
                        onClick={() => setSort('name')}>
                        Name
                      </SortableTh>
                      <SortableTh
                        sorted={getSorted('channels')}
                        onClick={() => setSort('channels')}>
                        Channels
                      </SortableTh>
                      <Table.Th
                        width={100}
                        style={{
                          textAlign: 'right',
                        }}>
                        Actions
                      </Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {templates.length === 0 && (
                      <Table.Tr>
                        <Table.Td colSpan={3}>
                          <Text p="md" fw="bold" ta="center">
                            No templates found.
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    )}
                    {templates.map((template) => {
                      return (
                        <Table.Tr key={template.id}>
                          <Table.Td>
                            <Anchor
                              size="sm"
                              component={Link}
                              to={`/templates/${template.id}`}>
                              {template.name}
                            </Anchor>
                          </Table.Td>
                          <Table.Td>
                            <Group gap="xs">
                              {template.channels.map((channel) => {
                                return <Badge key={channel}>{channel}</Badge>;
                              })}
                            </Group>
                          </Table.Td>
                          <Table.Td justify="flex-end">
                            <Actions
                              compact
                              template={template}
                              reload={reload}
                              displayMode="list"
                            />
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
                <Search.Pagination />
              </Table.ScrollContainer>
            </Stack>
          );
        }}
      </Search.Provider>
    </>
  );
}
