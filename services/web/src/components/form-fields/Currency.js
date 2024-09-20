import React from 'react';
import PropTypes from 'prop-types';
import { Label } from 'semantic';

import { getCurrencySymbol } from 'utils/currency';

import NumberField from './Number';

export default class CurrencyField extends React.Component {
  render() {
    let { value, cents, currency, ...rest } = this.props;
    if (cents) {
      value /= 100;
    }
    return (
      <NumberField value={value} labelPosition="right" {...rest}>
        <Label basic>{getCurrencySymbol(currency)}</Label>
        <input />
        {currency === 'USD' && <Label>.00</Label>}
      </NumberField>
    );
  }
}

CurrencyField.propTypes = {
  cents: PropTypes.bool,
  currency: PropTypes.string,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

CurrencyField.defaultProps = {
  currency: 'USD',
  cents: false,
};
