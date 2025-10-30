import { DateTime } from '@bedrockio/chrono';
import { Group, Popover, Text } from '@mantine/core';
import { DateInput, TimeGrid, TimeInput, getTimeRange } from '@mantine/dates';
import React, { useMemo, useState } from 'react';
import { PiCalendarBlankBold, PiClockBold } from 'react-icons/pi';

export default function DateTimeField(props) {
  const {
    name,
    value,
    label,
    startTime = '10:00',
    endTime = '21:00',
    interval = '00:30',
    ...rest
  } = props;

  const [timeOpen, setTimeOpen] = useState(false);

  const dt = useMemo(() => {
    return new DateTime(value);
  }, [value]);

  function onDateChange(newDate) {
    const next = new DateTime(newDate).setTime(dt.toTime());
    props.onChange(name, next);
  }

  function onClockClick() {
    setTimeOpen(true);
  }

  function onTimeClose() {
    setTimeOpen(false);
  }

  function onTimeChange(arg) {
    const newTime = typeof arg === 'string' ? arg : arg.target.value;
    const next = dt.setTime(newTime);
    props.onChange(name, next);
    setTimeOpen(false);
  }

  function getTimeValue() {
    if (value) {
      return new DateTime(value).toTime();
    } else {
      return '';
    }
  }

  function render() {
    return (
      <React.Fragment>
        <Text size="sm" fw="500">
          {label}
        </Text>
        <Group>
          <DateInput
            {...rest}
            value={value}
            onChange={onDateChange}
            rightSection={<PiCalendarBlankBold />}
            rightSectionPointerEvents="none"
          />
          <TimeInput
            {...rest}
            value={getTimeValue()}
            onChange={onTimeChange}
            rightSection={renderTimePopup()}
          />
        </Group>
      </React.Fragment>
    );
  }

  function renderTimePopup() {
    return (
      <Popover
        closeOnClickOutside
        onChange={onTimeClose}
        opened={timeOpen}
        onClose={onTimeClose}
        offset={2}
        withArrow>
        <Popover.Target>
          <PiClockBold onClick={onClockClick} />
        </Popover.Target>
        <Popover.Dropdown>
          <TimeGrid
            format="12h"
            amPmLabels={{ am: 'am', pm: 'pm' }}
            value={getTimeValue()}
            data={getTimeRange({
              startTime,
              endTime,
              interval,
            })}
            onChange={onTimeChange}
          />
        </Popover.Dropdown>
      </Popover>
    );
  }

  return render();
}
