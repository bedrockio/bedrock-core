import React from 'react';

import { Form, Checkbox } from 'semantic';

export default class extends React.Component {
  setAccepted = (evt, { checked }) => {
    this.props.onChange(evt, {
      ...this.props,
      value: checked,
    });
  };

  render() {
    const { value: accepted } = this.props;
    return (
      <Form.Field error={accepted === false}>
        <Checkbox
          name="accepted"
          label={
            <label>
              I accept the <a href="/terms">Terms of Service</a>.
            </label>
          }
          checked={accepted}
          onChange={this.onChange}
        />
      </Form.Field>
    );
  }
}
