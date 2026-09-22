import { Check, X } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

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
      return <Check className="size-4 text-green-600" />;
    } else if (checked === false) {
      return <X className="text-destructive size-4" />;
    }
  }

  function getStateLabel() {
    if (checked === true) {
      return 'Yes';
    } else if (checked === false) {
      return 'No';
    } else {
      return 'Off';
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      <div className="flex items-center gap-2">
        <Switch
          id={name}
          name={name}
          checked={checked != null}
          onCheckedChange={onChange}
        />
        {getIcon()}
        <span className="text-sm">{getStateLabel()}</span>
      </div>
    </div>
  );
}
