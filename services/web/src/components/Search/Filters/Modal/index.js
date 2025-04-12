import { useState, useContext, useEffect } from 'react';
import { omit } from 'lodash';
import { Button, Stack, Group, Badge, Modal } from '@mantine/core';
import { IconAdjustmentsHorizontal, IconFilter } from '@tabler/icons-react';

import { useDisclosure } from '@mantine/hooks';

import SearchContext from '../../Context';
//import Overview from './Overview';
import './modal.less';

function FilterModal({ size = 'small', children }) {
  const searchContext = useContext(SearchContext);

  const [opened, { open, close }] = useDisclosure(false);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    setFilters(searchContext.filters);
  }, [searchContext.filters]);

  function getFilterCount() {
    return Object.keys(searchContext.filters).filter((c) => c !== 'keyword')
      .length;
  }

  function handleFilterChange({ name, value }) {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    searchContext.setFilters({
      ...searchContext.filters,
      ...filters,
    });
    close();
  }

  function handleReset() {
    const newFilters = omit(searchContext.filters, Object.keys(filters));
    searchContext.setFilters(newFilters);
    setFilters({});
    close();
  }

  return (
    <>
      {searchContext.filterMapping ? (
        <Button
          variant="light"
          onClick={() => open()}
          rightSection={<IconAdjustmentsHorizontal size={18} />}>
          Filter
        </Button>
      ) : (
        <>
          <Button onClick={() => open()} variant="light" primary size={size}>
            <IconFilter size={16} />
            Filter
          </Button>
          {getFilterCount() > 0 && <Badge>{getFilterCount()}</Badge>}
        </>
      )}

      <Modal
        opened={opened}
        onClose={() => {
          setFilters(searchContext.filters);
          close();
        }}
        title="Filter">
        <form id="filters" onSubmit={handleSubmit}>
          <SearchContext.Provider
            value={{
              ...searchContext,
              filters,
              onFilterChange: handleFilterChange,
            }}>
            <Stack gap="md">{children}</Stack>
          </SearchContext.Provider>
        </form>

        <Group mt="md">
          <Button type="submit" form="filters">
            Apply
          </Button>
          <Button variant="default" onClick={handleReset}>
            Reset
          </Button>
        </Group>
      </Modal>
    </>
  );
}

export default FilterModal;
