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
import { formatDateTime } from 'utils/date';

import Actions from './Actions';

export default function DrugList() {
  async function onDataNeeded(body) {
    return await request({
      method: 'POST',
      path: '/1/drugs/search',
      body,
    });
  }

  function getFilterMapping() {
    return {
      category: {
        label: 'Category',
      },
      pregnancySafe: {
        label: 'Pregnancy Safe',
        type: 'boolean',
      },
      breastfeedingSafe: {
        label: 'Breastfeeding Safe',
        type: 'boolean',
      },
      createdAt: {
        label: 'Created At',
        type: 'date',
        range: true,
      },
      keyword: {},
    };
  }

  return (
    <>
      <Search.Provider
        onDataNeeded={onDataNeeded}
        filterMapping={getFilterMapping()}>
        {({ items: drugs, getSorted, setSort, reload, error, loading }) => {
          return (
            <Stack>
              <PageHeader
                title="Drugs"
                breadcrumbItems={[
                  {
                    href: '/',
                    title: 'Home',
                  },
                  {
                    title: 'Drugs',
                  },
                ]}
                rightSection={
                  <>
                    <Search.Export filename="drugs" />
                    <Protected endpoint="drugs" permission="create">
                      <Button
                        component={Link}
                        variant="primary"
                        to="/drugs/new">
                        New Drug
                      </Button>
                    </Protected>
                  </>
                }
              />

              <Group justify="space-between">
                <SearchFilters.Modal>
                  <SearchFilters.Search name="category" label="Category" />
                  <SearchFilters.Select
                    name="category"
                    label="Category"
                    data={[
                      {
                        label: 'Peptide',
                        value: 'peptide',
                      },
                      {
                        value: 'false',
                        label: 'No',
                      },
                    ]}
                  />
                  <SearchFilters.Select
                    name="pregnancySafe"
                    label="Pregnancy Safe"
                    data={[
                      { value: 'true', label: 'Yes' },
                      { value: 'false', label: 'No' },
                    ]}
                  />
                  <SearchFilters.Select
                    name="breastfeedingSafe"
                    label="Breastfeeding Safe"
                    data={[
                      { value: 'true', label: 'Yes' },
                      { value: 'false', label: 'No' },
                    ]}
                  />
                  <SearchFilters.DateRange
                    label="Created At"
                    name="createdAt"
                  />
                </SearchFilters.Modal>
                {loading && <Loader size={'sm'} />}

                <Group>
                  <Search.Total />
                  <SearchFilters.Keyword />
                </Group>
              </Group>

              <ErrorMessage error={error} />

              <Table stickyHeader striped>
                <Table.Thead>
                  <Table.Tr>
                    <SortableTh
                      sorted={getSorted('name')}
                      onClick={() => setSort('name')}>
                      Name
                    </SortableTh>
                    <Table.Th>Development Name</Table.Th>
                    <Table.Th>Category</Table.Th>
                    <Table.Th>Safety</Table.Th>
                    <SortableTh
                      sorted={getSorted('createdAt')}
                      onClick={() => setSort('createdAt')}
                      width={280}>
                      <Group>Created</Group>
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
                  {drugs.length === 0 && (
                    <Table.Tr>
                      <Table.Td colSpan={6}>
                        <Text p="md" fw="bold" ta="center">
                          No drugs found.
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                  {drugs.map((drug) => {
                    return (
                      <Table.Tr key={drug.id}>
                        <Table.Td>
                          <Anchor
                            size="sm"
                            component={Link}
                            to={`/drugs/${drug.id}`}>
                            {drug.name}
                          </Anchor>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="dimmed">
                            {drug.developmentName || '-'}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{drug.category || '-'}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            {drug.pregnancySafe && (
                              <Badge size="sm" color="green">
                                Pregnancy Safe
                              </Badge>
                            )}
                            {drug.breastfeedingSafe && (
                              <Badge size="sm" color="blue">
                                Breastfeeding Safe
                              </Badge>
                            )}
                          </Group>
                        </Table.Td>
                        <Table.Td>{formatDateTime(drug.createdAt)}</Table.Td>
                        <Table.Td justify="flex-end">
                          <Actions
                            compact
                            drug={drug}
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
            </Stack>
          );
        }}
      </Search.Provider>
    </>
  );
}
