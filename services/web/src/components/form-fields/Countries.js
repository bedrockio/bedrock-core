import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import allCountries from 'utils/countries';

const countries = allCountries.map(({ countryCode, nameEn }) => ({
  value: countryCode,
  label: nameEn,
  key: countryCode,
}));

export default function Countries(props) {
  const { name, value, label, placeholder = 'Select', error, ...rest } = props;

  function onValueChange(value) {
    props.onChange(name, value);
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <Label>{label}</Label>}
      <Select
        {...rest}
        value={value || undefined}
        onValueChange={onValueChange}>
        <SelectTrigger aria-invalid={error ? true : undefined}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => {
            return (
              <SelectItem key={country.key} value={country.value}>
                {country.label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {error && <p className="text-destructive text-sm">{error.message}</p>}
    </div>
  );
}
