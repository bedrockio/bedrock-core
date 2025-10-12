import { Badge, Button, Modal, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { omit } from 'lodash';
import React, { useEffect, useState } from 'react';
import { PiSlidersHorizontalBold } from 'react-icons/pi';

import Actions from 'components/form-fields/Actions';

import { SearchContext, useSearch } from '../Context';

function FilterModal(props) {
  const { size = 'md', children } = props;

  const search = useSearch();

  const [opened, { open, close }] = useDisclosure(false);

  const [filters, setFilters] = useState({
    ...search.filters,
  });

  function updateFilters(newFilters) {
    setFilters({
      ...filters,
      ...newFilters,
    });
  }

  useEffect(() => {
    setFilters({ ...omit(search.filters, 'keyword') });
  }, [opened]);

  function getFilterCount() {
    return Object.keys(omit(search.filters, 'keyword')).length;
  }

  function hasFilters() {
    return getFilterCount() > 0;
  }

  function onSubmit(evt) {
    evt.preventDefault();
    search.setFilters(filters);
    close();
  }

  function onResetClick() {
    if (hasFilters()) {
      setFilters({});
      search.resetFilters();
    }
    close();
  }

  function render() {
    return (
      <React.Fragment>
        <Button
          onClick={open}
          variant="default"
          leftSection={<PiSlidersHorizontalBold />}
          rightSection={renderBadge()}>
          Filter
        </Button>
        <Modal size={size} opened={opened} onClose={close} title="Filter">
          <form id="filters" onSubmit={onSubmit}>
            <SearchContext
              value={{
                ...search,
                filters,
                setFilters: updateFilters,
              }}>
              <Stack gap="md">{children}</Stack>
            </SearchContext>
          </form>
          <Actions>
            <Button variant="default" onClick={onResetClick}>
              Reset
            </Button>
            <Button type="submit" form="filters">
              Apply
            </Button>
          </Actions>
        </Modal>
      </React.Fragment>
    );
  }

  function renderBadge() {
    const count = getFilterCount();
    if (!search.loading && count > 0) {
      return <Badge circle>{count}</Badge>;
    }
  }

  return render();
}

export default FilterModal;
