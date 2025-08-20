import {
  Box,
  Combobox,
  Flex,
  InputBase,
  TextInput,
  useCombobox,
} from '@mantine/core';

import { omit } from 'lodash';
import PropTypes from 'prop-types';
import { useRef, useState } from 'react';

import { COUNTRIES, formatPhone } from 'utils/phone';

const COUNTRY_CODES_OPTIONS = Object.entries(COUNTRIES).map(
  ([code, countryData]) => ({
    prefix: countryData.prefix,
    value: code,
    label: `${countryData.name} ${countryData.prefix}`,
  }),
);

export function CountryCodeSelect({ value: defaultValue, onChange }) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const [value, setValue] = useState(defaultValue || '');

  const options = COUNTRY_CODES_OPTIONS.map(({ value, label }) => (
    <Combobox.Option value={value} key={value}>
      {label}
    </Combobox.Option>
  ));

  const displayValue =
    COUNTRY_CODES_OPTIONS.find((c) => c.value === value).prefix || '';

  return (
    <Combobox
      store={combobox}
      width={180}
      position="bottom-start"
      onOptionSubmit={(val) => {
        setValue(val);
        onChange(val);
        combobox.closeDropdown();
      }}>
      <Combobox.Target style={{ flex: 0 }}>
        <InputBase
          component="button"
          type="button"
          pointer
          onClick={() => combobox.toggleDropdown()}
          rightSectionPointerEvents="none">
          {displayValue || ''}
        </InputBase>
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options>{options}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}

const PhoneField = ({
  intl = false,
  country: defaultCountry = 'us',
  value,
  onChange,
  required,
  label,
  error,
  disabled,
  ...props
}) => {
  const [country, setCountry] = useState(defaultCountry);
  const inputRef = useRef(null);

  // Get country prefix
  const getPrefix = () => COUNTRIES[country].prefix;

  // Handle phone input change
  const handleChange = (value) => {
    let cleanValue = value
      .replace(/[ ()@.+-]/g, '')
      .replace(/^[01](\d)/, '$1')
      .replace(/[a-z]/gi, '')
      .trim();

    if (cleanValue) {
      cleanValue = `${getPrefix()}${cleanValue}`;
    } else {
      cleanValue = undefined;
    }

    onChange(cleanValue);
  };

  // Format phone number for display
  const getFormattedValue = () => {
    const countryData = COUNTRIES[country];
    return formatPhone(value || '', countryData);
  };

  // Handle country selection change
  const handleCountryChange = (newCountry) => {
    setCountry(newCountry);
    onChange('');
    inputRef.current?.focus();
  };

  const inputProps = omit(props, [
    ...Object.keys(PhoneField.propTypes),
    'onChange',
  ]);

  return (
    <Box>
      {intl ? (
        <TextInput
          {...inputProps}
          label={label}
          type="tel"
          autoComplete="tel"
          disabled={disabled}
          error={error?.hasField?.('phone')}
          value={getFormattedValue() || ''}
          onChange={(event) => handleChange(event.currentTarget.value)}
          inputContainer={(children) => (
            <Flex align="flex-end">
              <CountryCodeSelect
                value={country}
                onChange={handleCountryChange}
              />
              <Box style={{ flex: 1 }}>{children}</Box>
            </Flex>
          )}
        />
      ) : (
        <TextInput
          {...inputProps}
          required={required}
          label={label}
          disabled={disabled}
          error={error?.hasField?.('phone')}
          type="tel"
          autoComplete="tel"
          value={getFormattedValue() || ''}
          onChange={(event) => handleChange(event.currentTarget.value)}
          ref={inputRef}
        />
      )}
    </Box>
  );
};

PhoneField.propTypes = {
  intl: PropTypes.bool,
  country: PropTypes.string,
  label: PropTypes.string,
  error: PropTypes.instanceOf(Error),
};

export default PhoneField;
