import React from 'react';
import { Form } from 'semantic';

import RichTextEditor from 'components/RichTextEditor';

export default class RichTextField extends React.Component {
  render() {
    const { label, value, ...rest } = this.props;
    return (
      <Form.Field>
        {label && <label>{label}</label>}
        <RichTextEditor markdown={value} {...rest} toolbar />
      </Form.Field>
    );
  }
}

RichTextField.defaultProps = {
  scroll: true,
};
