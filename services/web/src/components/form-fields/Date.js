import { DateTime } from '@bedrockio/chrono';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

// This component is required as the native date input
// provides only the value in the onChange event and
// provides the value only as a string.

export default function DateField(props) {
  const { name, value, label, error, ...rest } = props;

  function getValue() {
    if (!value) {
      return '';
    }
    return new DateTime(value).toISODate();
  }

  function onChange(evt) {
    const dt = new DateTime(evt.target.value);
    props.onChange(name, dt);
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <Label>{label}</Label>}
      <Input
        {...rest}
        type="date"
        value={getValue()}
        aria-invalid={error ? true : undefined}
        onChange={onChange}
      />
      {error && <p className="text-destructive text-sm">{error.message}</p>}
    </div>
  );
}
