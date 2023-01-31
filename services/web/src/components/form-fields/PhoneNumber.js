import intlTelInput from 'intl-tel-input';
import 'intl-tel-input/build/css/intlTelInput.css';

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
    <Form.Field error={error}>
      <label>{label}</label>
      <div className="ui input">
        <input
          style={{ width: 'auto' }}
          type="tel"
          ref={inputRef}
          onBlur={() => {
            // setError(!iti.isValidNumber());
          }}
          onChange={(e) => {
            if (iti.isValidNumber()) {
              console.log('is valid number');
              onChange(e, {
                name: props.name,
                value: iti.getNumber(),
              });
            } else {
              setValue(iti.getNumber());
            }
          }}
          {...props}
        />
      </div>
    </Form.Field>
  );
}
