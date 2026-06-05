import PropTypes from 'prop-types';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useSearch } from '../Context';

export default function NumberFilter(props) {
  const { name, label, min, max } = props;

  const { filters, setFilters } = useSearch();

  function onChange(evt) {
    const raw = evt.target.value;
    const value = raw === '' ? '' : Number(raw);
    setFilters({
      [name]: value,
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <Label htmlFor={name}>{label}</Label>}
      <Input
        id={name}
        name={name}
        type="number"
        min={min}
        max={max}
        value={filters[name] ?? ''}
        onChange={onChange}
      />
    </div>
  );
}

NumberFilter.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.node,
  min: PropTypes.number,
  max: PropTypes.number,
};
