import { Chip, Stack, Text } from '@mantine/core';
import { PiCheckBold, PiXBold } from 'react-icons/pi';

import { useSearch } from '../Context';

export default function BooleanFilter(props) {
  const { name, label } = props;

  const { filters, setFilters } = useSearch();

  const checked = filters[name];

  function onChange(next) {
    let value;

    if (checked === true && !next) {
      value = false;
    } else if (checked === false && !next) {
      value = null;
    } else {
      value = true;
    }

    setFilters({
      [name]: value,
    });
  }

  function getIcon() {
    if (checked === true) {
      return <PiCheckBold />;
    } else if (checked === false) {
      return <PiXBold />;
    }
  }

  function getColor() {
    if (checked === true) {
      return 'green';
    } else if (checked === false) {
      return 'red';
    }
  }

  function getLabel() {
    if (checked === true) {
      return 'Yes';
    } else if (checked === false) {
      return 'No';
    } else {
      return 'Off';
    }
  }

  return (
    <Stack gap="0.3em">
      <Text size="sm" fw="500">
        {label}
      </Text>
      <Chip
        id={name}
        name={name}
        icon={getIcon()}
        color={getColor()}
        checked={checked != null}
        onChange={onChange}>
        {getLabel()}
      </Chip>
    </Stack>
  );
}
