import { X } from 'lucide-react';
import PropTypes from 'prop-types';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { useSearch } from '../Context';

export default function InputFilter(props) {
  const { name, label } = props;

  const { loading, filters, setFilters } = useSearch();

  function getValue() {
    return filters[name] || '';
  }

  function onClearClick() {
    setFilters({
      [name]: '',
    });
  }

  function onChange(evt) {
    setFilters({
      [name]: evt.target.value,
    });
  }

  return (
    <div className="flex min-w-[220px] flex-col gap-2">
      {label && <Label htmlFor={name}>{label}</Label>}
      <div className="relative">
        <Input
          id={name}
          name={name}
          disabled={loading}
          placeholder="Search by keyword"
          className="pr-9"
          value={getValue()}
          onChange={onChange}
        />
        {getValue() && (
          <span className="text-muted-foreground absolute inset-y-0 right-0 flex items-center pr-3">
            <X className="size-4 cursor-pointer" onClick={onClearClick} />
          </span>
        )}
      </div>
    </div>
  );
}

InputFilter.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.node,
};
