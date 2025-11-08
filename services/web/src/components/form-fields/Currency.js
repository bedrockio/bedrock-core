import PropTypes from 'prop-types';

import { getCurrencySymbol } from 'utils/currency';

import NumberField from './Number';

export default function CurrencyField(props) {
  let { value, currency = 'USD', ...rest } = props;

  function getValue() {
    if (value) {
      return value / 100;
    } else {
      return '';
    }
  }

  function onChange({ value, ...rest }) {
    if (value != null) {
      value *= 100;
    }

    props.onChange({ ...rest, value });
  }

  return (
    <NumberField
      {...rest}
      value={getValue()}
      leftSection={getCurrencySymbol(currency)}
      onChange={onChange}
    />
  );
}

CurrencyField.propTypes = {
  currency: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};
