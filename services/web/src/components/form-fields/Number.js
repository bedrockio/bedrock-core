import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function NumberField(props) {
  const { value, label, error, ...rest } = props;

  function onChange(evt) {
    const next = evt.target.value;
    const value = next === '' ? '' : Number(next);
    props.onChange({ ...rest, value });
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <Label>{label}</Label>}
      <Input
        {...rest}
        type="number"
        value={value ?? ''}
        aria-invalid={error ? true : undefined}
        onChange={onChange}
      />
      {error && <p className="text-destructive text-sm">{error.message}</p>}
    </div>
  );
}
