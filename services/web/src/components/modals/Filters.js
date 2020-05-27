import React from 'react';
import { Modal, Form, Dropdown, Icon, Button, Label } from 'semantic-ui-react';
import DateTimeField from 'components/form-fields/DateTime';

export default class Filters extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...props.filters,
    };
  }

  onSubmit = () => {
    this.props.onSave(this.state);
  };

  onReset = () => {
    const state = {};
    this.setState(state);
    this.props.onSave(state);
  };

  setFilter(name, value) {
    this.setState({
      [name]: value,
    });
  }

  hasFilters() {
    const { filters } = this.props;
    return filters && Object.keys(filters).length > 0;
  }

  render() {
    return (
      <Modal
        closeIcon
        size="tiny"
        trigger={
          this.hasFilters() ? (
            <Button as="div" labelPosition="right" style={{ marginRight: '10px' }}>
              <Button basic primary>
                <Icon name="filter" />
                Filter
              </Button>
              <Label as="a" basic color="blue" pointing="left">
                {Object.keys(this.props.filters).length}
              </Label>
            </Button>
          ) : (
            <Button basic primary style={{ marginRight: '10px' }}>
              <Icon name="filter" />
              Filter
            </Button>
          )
        }>
        <Modal.Header>Filter</Modal.Header>
        <Modal.Content>
          <Form>
            {this.renderFields()}
            {this.renderDateFilters()}
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button content="Reset" onClick={this.onReset} />
          <Button primary content="Apply" onClick={this.onSubmit} />
        </Modal.Actions>
      </Modal>
    );
  }

  renderDateFilters() {
    const { startAt, endAt } = this.state;
    return (
      <Form.Field>
        <label>Created At</label>
        <span style={{ display: 'inline-block', verticalAlign: 'middle' }}>
          <DateTimeField
            name="startAt"
            value={startAt}
            placeholder="No Start"
            includeTime={false}
            onChange={(value) => this.setFilter('startAt', value)}
            clearable
          />
        </span>
        <span
          style={{
            display: 'inline-block',
            verticalAlign: 'middle',
            margin: '0 10px',
            opacity: '.2',
          }}>
          &ndash;
        </span>
        <span style={{ display: 'inline-block', verticalAlign: 'middle' }}>
          <DateTimeField
            name="endAt"
            value={endAt}
            placeholder="No End"
            includeTime={false}
            onChange={(value) => this.setFilter('endAt', value)}
            clearable
          />
        </span>
      </Form.Field>
    );
  }

  renderFields() {
    const { fields } = this.props;
    if (fields) {
      return (
        <React.Fragment>
          {fields.map((field) => {
            const { name, text, search } = field;
            return (
              <Form.Field key={name}>
                <label htmlFor={name}>{text}</label>
                <Dropdown
                  id={name}
                  search={search || false}
                  clearable
                  selection
                  options={field.options}
                  fluid
                  placeholder="Select"
                  value={this.state[name]}
                  onChange={(e, { value }) => this.setFilter(name, value)}
                />
              </Form.Field>
            );
          })}
        </React.Fragment>
      );
    }
  }
}
