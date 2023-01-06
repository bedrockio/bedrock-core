import React, { useEffect, useState } from 'react';
import { isValid, parse } from 'date-fns';

import { DayPicker } from 'react-day-picker';
import { Popup, Input } from 'semantic';

import 'react-day-picker/dist/style.css';

export default function DateInput({
  placeholder,
  onChange,
  value,
  formatDate,
} = {}) {
  const [selected, setSelected] = useState(value);
  const [inputValue, setInputValue] = useState(value);
  const [isPopperOpen, setIsPopperOpen] = useState(false);

  useEffect(() => {
    setSelected(value);
    setInputValue(value);
  }, [value]);

  const closePopper = () => {
    setIsPopperOpen(false);
  };

  const handleInputChange = (e) => {
    setInputValue(e.currentTarget.value);
    const date = parse(e.currentTarget.value, 'y-MM-dd', new Date());
    if (isValid(date)) {
      setSelected(date);
      onChange(date);
    } else {
      setSelected(undefined);
    }
  };

  const handleDaySelect = (date) => {
    setSelected(date);
    if (date) {
      setInputValue(date);
      onChange(date);
      closePopper();
    } else {
      setInputValue('');
    }
  };

  return (
    <Popup
      eventsEnabled
      on="click"
      trigger={
        <Input
          onFocus={() => setIsPopperOpen(true)}
          type="text"
          readOnly
          placeholder={placeholder}
          value={inputValue ? formatDate(inputValue) : ''}
          onChange={handleInputChange}
        />
      }
      content={
        <div className="date-field">
          <DayPicker
            initialFocus={isPopperOpen}
            mode="single"
            defaultMonth={selected}
            selected={selected}
            onSelect={handleDaySelect}
            style={{ margin: 0 }}
          />
        </div>
      }
    />
  );
}
