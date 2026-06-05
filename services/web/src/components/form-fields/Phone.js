import PropTypes from 'prop-types';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import { COUNTRIES, formatPhone } from 'utils/phone';

export default function PhoneField(props) {
  const { name, country = 'us', error, label, ...rest } = props;

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

  const hasError = error?.hasField?.('phone');

  return (
    <div className="flex flex-col gap-2">
      {label && <Label>{label}</Label>}
      <Input
        {...rest}
        type="tel"
        autoComplete="tel"
        value={getFormatted()}
        aria-invalid={hasError ? true : undefined}
        onChange={onChange}
      />
    </div>
  );
}

PhoneField.propTypes = {
  intl: PropTypes.bool,
  country: PropTypes.string,
  label: PropTypes.string,
  error: PropTypes.instanceOf(Error),
};
