import React from 'react';
import { Modal, Form, Dropdown, Icon, Button } from 'semantic-ui-react';
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
  }

  setFilter(name, value) {
    this.setState({
      [name]: value
    });
  }

  hasFilters() {
    const { filters } = this.props;
    return filters && Object.keys(filters).length > 0;
  }

  render() {
    return (
      <Modal
        size="tiny"
        trigger={
          <Icon
            style={{margin:'8px', cursor: 'pointer'}}
            color={this.hasFilters() ? 'orange' : 'grey'}
            name="filter"
          />
        }>
        <Modal.Header>
          Filter
        </Modal.Header>
        <Modal.Content>
          <Form>
            {this.renderFields()}
            {this.renderDateFilters()}
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button
            primary
            content="Save"
            onClick={this.onSubmit}
          />
        </Modal.Actions>
      </Modal>
    );
  }

  renderDateFilters() {
    const { startAt, endAt } = this.state;
    return (
      <Form.Field>
        <label>Created At</label>
        <span style={{display: 'inline-block', verticalAlign: 'middle'}}>
          <DateTimeField
            name="startAt"
            value={startAt}
            placeholder="No Start"
            includeTime={false}
            onChange={(value) => this.setFilter('startAt', value)}
            clearable
          />
        </span>
        <span style={{
          display: 'inline-block',
          verticalAlign: 'middle',
          margin: '0 10px',
          opacity: '.2',
        }}>
          &ndash;
        </span>
        <span style={{display: 'inline-block', verticalAlign: 'middle'}}>
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
            const { name, text } = field;
            return (
              <Form.Field key={name}>
                <label htmlFor={name}>
                  {text}
                </label>
                <Dropdown
                  id={name}
                  clearable
                  selection
                  options={field.options}
                  style={{width: 'auto'}}
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
