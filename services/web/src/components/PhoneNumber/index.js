import { useEffect, useRef, useState } from 'react';
import intlTelInput from 'intl-tel-input';
import 'intl-tel-input/build/css/intlTelInput.css';
import './phone-number.less';

export default function PhoneNumber({
  preferredCountries = ['us'],
  value: propsValue,
  label,
  onChange = () => {},
  ...props
}) {
  const inputRef = useRef(null);
  const [intlInstance, setIntlInstance] = useState(null);
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
      setIntlInstance(instance);
      return () => {
        instance.destroy();
      };
    }
  }, [inputRef.current]);

  useEffect(() => {
    if (intlInstance && propsValue) {
      intlInstance.setNumber(propsValue);
    }
  }, [intlInstance, propsValue]);

  useEffect(() => {
    if (intlInstance && value) {
      intlInstance.setNumber(value);
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
          if (intlInstance.isValidNumber()) {
            onChange(e, {
              name: props.name,
              value: intlInstance.getNumber(),
            });
            setError(false);
          } else {
            setError(e.target.value.length ? true : false);
            setValue(intlInstance.getNumber());
          }
        }}
        {...props}
      />
    </div>
  );
}
