import { TextInput } from '@mantine/core';
import PropTypes from 'prop-types';

import { COUNTRIES, formatPhone } from 'utils/phone';

export default function PhoneField(props) {
  const { name, country = 'us', error, ...rest } = props;

  function getPrefix() {
    return COUNTRIES[country].prefix;
  }

  function onChange(evt) {
    let value = evt.target.value;

    value = value.trim();
    value = value.replace(/[ ()@.+-]/g, '');
    value = value.replace(/^[01](\d)/, '$1');
    value = value.replace(/[a-z]/gi, '');

    if (value) {
      value = `${getPrefix()}${value}`;
    } else {
      value = null;
    }

    props.onChange(name, value);
  }

  function getFormatted() {
    return formatPhone(props.value, country);
  }

  return (
    <TextInput
      {...rest}
      error={error?.hasField?.('phone')}
      type="tel"
      autoComplete="tel"
      value={getFormatted()}
      onChange={onChange}
    />
  );
}

PhoneField.propTypes = {
  intl: PropTypes.bool,
  country: PropTypes.string,
  label: PropTypes.string,
  error: PropTypes.instanceOf(Error),
};
