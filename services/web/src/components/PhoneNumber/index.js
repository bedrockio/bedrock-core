import intlTelInput from 'intl-tel-input';
import 'intl-tel-input/build/css/intlTelInput.css';
import './phone-number.less';

import React, { useEffect, useRef, useState } from 'react';
import { Form } from 'semantic';

export default function PhoneNumber({
  preferredCountries = ['us'],
  value: propsValue,
  label,
  onChange = () => {},
  ...props
}) {
  const inputRef = useRef(null);
  const [iti, setIntlTel] = useState(null);
  const [error, setError] = useState(false);
  const [value, setValue] = useState(propsValue);

  useEffect(() => {
    if (inputRef.current) {
      const instance = intlTelInput(inputRef.current, {
        preferredCountries: preferredCountries,
        separateDialCode: true,
        utilsScript:
          'https://cdn.jsdelivr.net/npm/intl-tel-input/build/js/utils.js',
      });
      setIntlTel(instance);
      return () => {
        instance.destroy();
      };
    }
  }, [inputRef.current]);

  useEffect(() => {
    if (iti && propsValue) {
      iti.setNumber(propsValue);
    }
  }, [iti, propsValue]);

  useEffect(() => {
    if (iti && value) {
      iti.setNumber(value);
    }
  }, [value]);

  return (
    <div
      className={['ui', error && 'error', 'input'].filter(Boolean).join(' ')}>
      <input
        type="tel"
        autoComplete="tel"
        ref={inputRef}
        onChange={(e) => {
          // only trigger on change if is valid number
          if (iti.isValidNumber()) {
            onChange(e, {
              name: props.name,
              value: iti.getNumber(),
            });
            setError(false);
          } else {
            setError(e.target.value.length ? true : false);
            setValue(iti.getNumber());
          }
        }}
        {...props}
      />
    </div>
  );
}
