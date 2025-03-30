import React from 'react';
import { omit } from 'lodash';
import PropTypes from 'prop-types';
import { Button, Stack, Group, Badge } from '@mantine/core';

import { IconAdjustmentsHorizontal, IconFilter } from '@tabler/icons-react';

import SearchContext from '../../Context';
import Overview from './Overview';

import './modal.less';
import ModalTrigger from 'components/ModalTrigger';

export default class FilterModal extends React.Component {
  static contextType = SearchContext;

  constructor(props) {
    super(props);
    this.state = {
      open: false,
      filters: {},
    };
    this.formRef = React.createRef();
  }

  componentDidMount() {
    this.setState({
      filters: this.context.filters,
    });
  }

  getFilterCount = () => {
    return Object.keys(this.context.filters).filter((c) => c !== 'keyword')
      .length;
  };

  onModalOpen = () => {
    this.setState({
      open: true,
      filters: this.context.filters,
    });
  };

  onModalClose = () => {
    this.setState({
      open: false,
      filters: this.prevFilters,
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

    console.log({
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
      <>
        <ModalTrigger
          title="Filters"
          trigger={
            this.context.filterMapping ? (
              <Button
                variant="outline"
                rightSection={<IconAdjustmentsHorizontal size={18} />}>
                Filter
              </Button>
            ) : (
              <>
                <Button variant="outline" primary size={size}>
                  <IconFilter size={16} />
                  Filter
                </Button>
                {this.getFilterCount() > 0 && (
                  <Badge>{this.getFilterCount()}</Badge>
                )}
              </>
            )
          }>
          <form id="filters" onSubmit={this.onSubmit}>
            <SearchContext.Provider
              value={{
                ...this.context,
                filters: this.state.filters,
                onFilterChange: this.onFilterChange,
              }}>
              <Stack gap="md">{this.props.children}</Stack>
            </SearchContext.Provider>
          </form>

          <Group mt="md">
            <Button form="filters" onClick={this.onSubmit}>
              Apply
            </Button>
            <Button variant="default" onClick={this.onReset}>
              Reset
            </Button>
          </Group>
        </ModalTrigger>
      </>
    );
  }
}

FilterModal.propTypes = {
  size: PropTypes.string,
};
