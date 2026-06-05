import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          name="gte"
          type="date"
          value={filters[name]?.gte || ''}
          placeholder="Start"
          onChange={(evt) => onChange('gte', evt.target.value || null)}
        />
        <Input
          name="lte"
          type="date"
          value={filters[name]?.lte || ''}
          placeholder="End"
          onChange={(evt) => onChange('lte', evt.target.value || null)}
        />
      </div>
    </div>
  );
}

DateRangeFilter.propTypes = {
  value: PropTypes.object,
  name: PropTypes.string.isRequired,
};
