import { Chip, Group, Text } from '@mantine/core';
import React from 'react';

export default function ChipsField(props) {
  const { name, value: values = [], label, options } = props;

  function onChange(value, checked) {
    let newValues;
    if (checked) {
      newValues = [...values, value];
    } else {
      newValues = values.filter((v) => {
        return v !== value;
      });
    }
    props.onChange(name, newValues);
  }

  return (
    <React.Fragment>
      <Text size="sm" fw="500">
        {label}
      </Text>
      <Group gap="1em">
        {options.map((option) => {
          const { label, value } = option;
          return (
            <Chip
              key={value}
              checked={values.includes(value)}
              onChange={(checked) => {
                onChange(value, checked);
              }}>
              {label}
            </Chip>
          );
        })}
      </Group>
    </React.Fragment>
  );
}
