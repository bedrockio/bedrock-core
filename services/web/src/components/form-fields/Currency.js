import PropTypes from 'prop-types';
import React from 'react';

import { getCurrencySymbol } from 'utils/currency';

import NumberField from './Number';

export default class CurrencyField extends React.Component {
  render() {
    let { value, cents, currency = 'USD', ...rest } = this.props;
    if (cents) {
      value /= 100;
    }

    return (
      <NumberField
        leftSection={getCurrencySymbol(currency)}
        value={value}
        labelPosition="right"
        {...rest}
      />
    );
  }
}

CurrencyField.propTypes = {
  cents: PropTypes.bool,
  currency: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};
