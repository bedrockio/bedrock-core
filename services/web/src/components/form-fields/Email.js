import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function EmailField(props) {
  const { label = 'Email', error, ...rest } = props;
  return (
    <div className="flex flex-col gap-2">
      {label && <Label>{label}</Label>}
      <Input
        name="email"
        type="email"
        placeholder="Email"
        autoComplete="email"
        aria-invalid={error ? true : undefined}
        {...rest}
      />
      {error && <p className="text-destructive text-sm">{error.message}</p>}
    </div>
  );
}
