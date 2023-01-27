import intlTelInput from 'intl-tel-input';
import 'intl-tel-input/build/css/intlTelInput.css';

import React, { useEffect, useRef, useState } from 'react';
import { Form } from 'semantic';

export default function PhoneNumber(props) {
  const inputRef = useRef(null);
  const [iti, setIntlTel] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (inputRef.current) {
      const instance = intlTelInput(inputRef.current, {
        preferredCountries: ['us'],
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
    if (iti && props.value) {
      iti.setNumber(props.value);
    }
  }, [iti, props.value]);

  return (
    <Form.Field error={error}>
      <label>{props.label}</label>
      <div className="ui input">
        <input
          style={{ width: 'auto' }}
          name={props.name}
          type="tel"
          ref={inputRef}
          onBlur={() => {
            setError(!iti.isValidNumber());
          }}
          onChange={(e) => {
            props.onChange(e, {
              name: props.name,
              value: iti.getNumber(),
            });
          }}
        />
      </div>
    </Form.Field>
  );
}
