import { useState, useMemo } from 'react';

import { isValid } from 'date-fns';
import { DayPicker } from 'react-day-picker';

import { Popup, Input, Icon } from 'semantic';

import { formatDate } from 'utils/date';

import 'react-day-picker/style.css';
import './date-input.less';

const DEFAULT_YEAR_REG = /\d{4}|[-/]\d{2}/;

// Allow any dates parseable by Javascript, however
// exclude odd results that may be caused by partial
// input. For example "08" defaults to August 2001,
// which is unexpected. Additionally do simple year
// checks to prevent unexpected input.
function parse(str) {
  str = str.trim();

  const date = new Date(str);

  if (date.getFullYear() === 2001) {
    if (!DEFAULT_YEAR_REG.test(str)) {
      date.setFullYear(new Date().getFullYear());
    }
  }

  const year = date.getFullYear();

  if (year < 1800 || year > 9999) {
    return null;
  }

  return date;
}

// A date without an associated time should be in UTC time,
// so remove the timezone offset here.
function resetTime(date) {
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
}

export default function DateInput(props) {
  const { value, onChange, onCommit, ...rest } = props;

  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const date = useMemo(() => {
    return value ? new Date(value) : null;
  }, [value]);

  const onInputChange = (evt, { value }) => {
    setInputValue(value);
    onChange(evt, null);
  };

  const onSelect = (date, prev, modifiers, evt) => {
    resetTime(date);
    setInputValue('');
    onCommit(true);
    setOpen(false);
    onChange(evt, date);
  };

  const getValue = () => {
    if (inputValue) {
      return inputValue;
    } else if (date) {
      // The date without an associated time should be
      // considered UTC so ensure that any timezone defaults
      // are overridden here.
      return formatDate(date, {
        timeZone: 'UTC',
      });
    } else {
      return '';
    }
  };

  function onBlur(evt) {
    if (inputValue) {
      const date = parse(inputValue);
      if (isValid(date)) {
        resetTime(date);
        setInputValue('');
        onChange(evt, date);
        onCommit(true);
      } else {
        onChange(evt, null);
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
              month={date}
              selected={date}
              onSelect={onSelect}
            />
          }
        />
      }
    />
  );
}
