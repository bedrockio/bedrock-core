import React from 'react';
import { Group, Stack, Text } from '@mantine/core';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';

import { DateInput } from '@mantine/dates';

import SearchContext from '../Context';

export default class DateRangeFilter extends React.Component {
  static contextType = SearchContext;

  onChange = ({ name: part }, value) => {
    const { name } = this.props;

    const range = this.context.filters[name] || {};
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

    if (this.props.onChange) {
      this.props.onChange({
        name,
        value: {
          ...value,
        },
      });
    } else {
      this.context.onFilterChange({
        name,
        value: {
          ...value,
        },
      });
    }
  };

  render() {
    const { label, name } = this.props;
    return (
      <Stack gap={0}>
        <Text size="sm">{label}</Text>
        <Group justify="space-between" wrap="no-wrap">
          <DateInput
            name="gte"
            value={this.context.filters[name]?.gte}
            placeholder="Start"
            onChange={this.onChange.bind(this, { name: 'gte' })}
            clearable
          />
          <span className="divider">&ndash;</span>
          <DateInput
            name="lte"
            value={this.context.filters[name]?.lte}
            placeholder="Present"
            onChange={this.onChange.bind(this, { name: 'lte' })}
            clearable
          />
        </Group>
      </Stack>
    );
  }
}

DateRangeFilter.propTypes = {
  value: PropTypes.object,
  name: PropTypes.string.isRequired,
};

DateRangeFilter.defaultProps = {
  object: true,
  value: {},
};
