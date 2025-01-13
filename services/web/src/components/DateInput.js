import { useEffect, useState } from 'react';

// eslint-disable-next-line
import { isValid } from 'date-fns';
// eslint-disable-next-line
import { DayPicker } from 'react-day-picker';

import { Popup, Input, Icon } from 'semantic';

import { formatDate } from 'utils/date';

// eslint-disable-next-line
import 'react-day-picker/style.css';
import './date-input.less';

const DISALLOWED_REG = /^\d+[-/]?$/;

// Allow any dates parseable by Javascript, however
// exclude odd results that may be caused by partial
// input. For example "08" defaults to August 2001,
// which is unexpected. Additionally do simple year
// checks to prevent unexpected input.
function parse(str) {
  str = str.trim();

  if (DISALLOWED_REG.test(str)) {
    return null;
  }

  const date = new Date(str);
  const year = date.getFullYear();

  if (year < 1800 || year > 9999) {
    return null;
  }

  return date;
}

export default function DateInput(props) {
  const { value, onChange, onCommit, ...rest } = props;

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(value);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    setSelected(value);
  }, [value]);

  useEffect(() => {
    if (selected !== value) {
      onChange(selected || null);
    }
  }, [selected]);

  const onInputChange = (evt, { value }) => {
    setInputValue(value);
    setSelected(null);
  };

  const onSelect = (date) => {
    // A date without an associated time should be in UTC time,
    // so remove the timezone offset here.
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

    setInputValue('');
    setSelected(date);
    onCommit(true);
    setOpen(false);
  };

  const getValue = () => {
    if (inputValue) {
      return inputValue;
    } else if (selected) {
      // The date without an associated time should be
      // considered UTC so ensure that any timezone defaults
      // are overridden here.
      return formatDate(selected, {
        timeZone: 'UTC',
      });
    } else {
      return '';
    }
  };

  function onBlur() {
    if (inputValue) {
      const date = parse(inputValue);

      if (isValid(date)) {
        setInputValue('');
        setSelected(date);
        onCommit(true);
      } else {
        setSelected(null);
        onCommit(false);
      }
    }
  }

  return (
    <Input
      {...rest}
      value={getValue()}
      onChange={onInputChange}
      onBlur={onBlur}
      icon={
        <Popup
          on="click"
          open={open}
          hideOnScroll
          onOpen={() => {
            setOpen(true);
          }}
          onClose={() => {
            setOpen(false);
          }}
          trigger={
            <Icon
              name="calendar"
              style={{
                cursor: 'pointer',
                pointerEvents: 'auto',
              }}
            />
          }
          content={
            <DayPicker
              mode="single"
              month={selected}
              selected={selected}
              onSelect={onSelect}
            />
          }
        />
      }
    />
  );
}
