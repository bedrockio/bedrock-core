import { DateTime } from '@bedrockio/chrono';
import { useMemo } from 'react';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function DateTimeField(props) {
  const {
    name,
    value,
    label,
    error,
    // eslint-disable-next-line no-unused-vars
    startTime = '10:00',
    // eslint-disable-next-line no-unused-vars
    endTime = '21:00',
    // eslint-disable-next-line no-unused-vars
    interval = '00:30',
    ...rest
  } = props;

  const dt = useMemo(() => {
    return value ? new DateTime(value) : null;
  }, [value]);

  function getValue() {
    if (!dt) {
      return '';
    }
    // datetime-local expects `YYYY-MM-DDTHH:mm`.
    const date = dt.toISODate();
    const time = dt.toTime().slice(0, 5);
    return `${date}T${time}`;
  }

  function onChange(evt) {
    const next = new DateTime(evt.target.value);
    props.onChange(name, next);
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <Label>{label}</Label>}
      <Input
        {...rest}
        type="datetime-local"
        value={getValue()}
        aria-invalid={error ? true : undefined}
        onChange={onChange}
      />
      {error && <p className="text-destructive text-sm">{error.message}</p>}
    </div>
  );
}
