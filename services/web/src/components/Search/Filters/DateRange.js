import { Group, Stack, Text } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';

import { useSearch } from '../Context';

export default function DateRangeFilter(props) {
  const { name, label } = props;

  const { filters, setFilters } = useSearch();

  function onChange(part, value) {
    const range = {
      ...filters[name],
    };
    if (name === 'gte' && value === null) {
      delete range['lte'];
    }

    if (value) {
      range[part] = value;
    } else {
      // start = null => reset range to avoid
      if (part === 'gte') {
        delete range['lte'];
      }
      delete range[part];
    }

    value = isEmpty(range) ? null : range;

    setFilters({
      [name]: value,
    });
  }

  return (
    <Stack gap={0}>
      <Text size="sm" fw="500">
        {label}
      </Text>
      <Group wrap="no-wrap">
        <DateInput
          name="gte"
          value={filters[name]?.gte}
          placeholder="Start"
          onChange={(value) => onChange('gte', value)}
          clearable
        />
        <DateInput
          name="lte"
          value={filters[name]?.lte}
          placeholder="End"
          onChange={(value) => onChange('lte', value)}
          clearable
        />
      </Group>
    </Stack>
  );
}

DateRangeFilter.propTypes = {
  value: PropTypes.object,
  name: PropTypes.string.isRequired,
};
