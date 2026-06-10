import PropTypes from 'prop-types';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

import { useSearch } from '../Context';

export default function CheckboxFilter(props) {
  const { name, label, ...rest } = props;

  const { filters, setFilters } = useSearch();

  function onChange(checked) {
    setFilters({
      [name]: checked === true,
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id={name}
        name={name}
        checked={filters[name] || false}
        onCheckedChange={onChange}
        {...rest}
      />
      {label && <Label htmlFor={name}>{label}</Label>}
    </div>
  );
}

CheckboxFilter.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.node,
};
