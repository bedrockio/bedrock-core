import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// This wrapper is needed to provide a placeholder
// and keep the legacy onChange(name, value) signature.

export default function NativeSelect(props) {
  const { name, value, label, placeholder, options, error, ...rest } = props;

  function getPlaceholder() {
    if (placeholder) {
      return placeholder;
    } else if (label) {
      return `Select ${label}`;
    } else {
      return 'Select';
    }
  }

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
          <SelectValue placeholder={getPlaceholder()} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => {
            return (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {error && <p className="text-destructive text-sm">{error.message}</p>}
    </div>
  );
}
