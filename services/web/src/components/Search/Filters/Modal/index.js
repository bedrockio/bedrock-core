import { useState, useContext, useEffect } from 'react';
import { omit } from 'lodash';
import { Button, Stack, Group, Badge, Modal } from '@mantine/core';
import { IconAdjustmentsHorizontal, IconFilter } from '@tabler/icons-react';

import { useDisclosure } from '@mantine/hooks';

import SearchContext from '../../Context';
//import Overview from './Overview';
import './modal.less';

function FilterModal({ size = 'sm', children }) {
  const searchContext = useContext(SearchContext);

  const [opened, { open, close }] = useDisclosure(false);
  const [filters, setFilters] = useState({});

<<<<<<< HEAD
  useEffect(() => {
    setFilters(searchContext.filters);
  }, [searchContext.filters]);
=======
  componentDidMount() {
    this.setState({
      filters: {
        ...this.context.filters,
      },
    });
  }
>>>>>>> master

  function getFilterCount() {
    return Object.keys(searchContext.filters).filter((c) => c !== 'keyword')
      .length;
<<<<<<< HEAD
=======
  };

  onModalOpen = () => {
    this.setState({
      open: true,
      filters: {
        ...this.context.filters,
      },
    });
  };

  onModalClose = () => {
    this.setState({
      open: false,
      filters: {
        ...this.prevFilters,
      },
    });
  };

  onFilterChange = ({ name, value }) => {
    this.setState({
      filters: {
        ...this.state.filters,
        [name]: value,
      },
    });
  };

  onSubmit = () => {
    this.context.setFilters({
      ...this.context.filters,
      ...this.state.filters,
    });

    this.setState({
      open: false,
    });
  };

  onReset = () => {
    let { filters } = this.context;
    filters = omit(filters, Object.keys(this.state.filters));
    this.context.setFilters(filters);
    this.setState({
      open: false,
      filters: {},
    });
  };

  render() {
    const { size = 'small' } = this.props;
    return (
      <div className="search-filters-modal">
        <Modal
          closeIcon
          size={size}
          open={this.state.open}
          onOpen={this.onModalOpen}
          onClose={this.onModalClose}
          trigger={
            this.context.filterMapping ? (
              <Button basic primary size={size}>
                <Icon name="filter" />
                Filter
              </Button>
            ) : (
              <Button as="div" labelPosition="right">
                <Button basic primary size={size}>
                  <Icon name="filter" />
                  Filter
                </Button>
                {this.getFilterCount() > 0 && (
                  <Label pointing="left">{this.getFilterCount()}</Label>
                )}
              </Button>
            )
          }>
          <Modal.Header>Filter</Modal.Header>
          <Modal.Content>
            <Ref innerRef={this.formRef}>
              <Form id="filters" onSubmit={this.onSubmit}>
                <SearchContext.Provider
                  value={{
                    ...this.context,
                    filters: this.state.filters,
                    onFilterChange: this.onFilterChange,
                  }}>
                  <AutoFocus>{this.props.children}</AutoFocus>
                </SearchContext.Provider>
              </Form>
            </Ref>
          </Modal.Content>
          <Modal.Actions>
            <Button content="Reset" onClick={this.onReset} />
            <Button primary form="filters" content="Apply" />
          </Modal.Actions>
        </Modal>

        {this.context.filterMapping && this.getFilterCount() > 0 && (
          <Popup
            offset={[0, 10]}
            on={['click', 'hover']}
            style={{ padding: 0, minWidth: '280px' }}
            hoverable
            position="bottom center"
            flowing
            trigger={
              <Label pointing="left">{this.getFilterCount()} Filters</Label>
            }>
            <Overview />
          </Popup>
        )}
      </div>
    );
>>>>>>> master
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
          variant="default"
          onClick={() => open()}
          rightSection={<IconAdjustmentsHorizontal size={14} />}>
          Filter
        </Button>
      ) : (
        <>
          <Button onClick={() => open()} variant="light" primary>
            <IconFilter size={14} />
            Filter
          </Button>
          {getFilterCount() > 0 && <Badge>{getFilterCount()}</Badge>}
        </>
      )}

      <Modal
        size={size}
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
