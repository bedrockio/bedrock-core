import React from 'react';
import { omit } from 'lodash';
import PropTypes from 'prop-types';
import { Modal, Form, Ref, Icon, Button, Label, Popup } from 'semantic';
import Overview from './Overview';

import SearchContext from '../Context';

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

  hasFilters = () => {
    return !this.context.filterMapping && this.getFilterCount() > 0;
  };

  getFilterCount = () => {
    const keys = Object.keys(this.context.filters);
    return keys.filter((key) => {
      return this.state.filters[key] !== undefined;
    }).length;
  };

  onModalOpen = () => {
    this.setState({
      open: true,
      filters: this.context.filters,
    });
    setTimeout(() => {
      const input = this.formRef.current.querySelector('input[name]');
      input?.focus();
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
    const { size } = this.props;
    return (
      <Modal
        closeIcon
        size={size || 'small'}
        open={this.state.open}
        onOpen={this.onModalOpen}
        onClose={this.onModalClose}
        trigger={
          this.hasFilters() ? (
            <Popup
              offset={[0, 10]}
              on={['hover', 'click']}
              style={{ marginLeft: 0 }}
              hoverable
              position="bottom center"
              flowing
              trigger={
                <Label as="a" pointing="left">
                  {this.getFilterCount()} Filters
                </Label>
              }>
              <div
                style={{
                  paddingBottom: '4px',
                  fontWeight: 500,
                  borderBottom: '1px solid #ccc',
                }}>
                Enabled Filters
              </div>
              <Overview />
            </Popup>
          ) : (
            <Button basic primary size={size}>
              <Icon name="filter" />
              Filter
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
                {this.props.children}
              </SearchContext.Provider>
            </Form>
          </Ref>
        </Modal.Content>
        <Modal.Actions>
          <Button content="Reset" onClick={this.onReset} />
          <Button primary form="filters" content="Apply" />
        </Modal.Actions>
      </Modal>
    );
  }
}

FilterModal.propTypes = {
  size: PropTypes.string,
};
