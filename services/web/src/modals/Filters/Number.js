import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'semantic-ui-react';

export default class NumberFilter extends React.Component {
  render() {
    const { name, value, min, max, onChange } = this.props;
    return (
      <Form.Input
        id={name}
        type="number"
        min={min}
        max={max}
        icon={value != '' && {
          name: 'close',
          link: true,
          onClick: (evt) => {
            onChange(evt, { name, value: '' });
            evt.target.parentNode.querySelector('input').focus();
          },
        }}
        {...this.props}
      />
    );
  }
}

NumberFilter.propTypes = {
  ...Form.Input.propTypes,
  name: PropTypes.string.isRequired,
};
