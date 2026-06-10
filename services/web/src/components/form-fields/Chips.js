import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

export default function ChipsField(props) {
  const { name, value: values = [], label, options } = props;

  function onChange(value, checked) {
    let newValues;
    if (checked) {
      newValues = [...values, value];
    } else {
      newValues = values.filter((v) => {
        return v !== value;
      });
    }
    props.onChange(name, newValues);
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <Label>{label}</Label>}
      <div className="flex flex-wrap items-center gap-2">
        {options.map((option) => {
          const { label, value } = option;
          const checked = values.includes(value);
          return (
            <Badge
              key={value}
              role="checkbox"
              aria-checked={checked}
              variant={checked ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => {
                onChange(value, !checked);
              }}>
              {label}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
