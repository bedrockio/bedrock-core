import { X } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

// onChange keeps the legacy object signature 👎

export default function TagsField(props) {
  const { value = [], label, placeholder, error, ...rest } = props;
  const [input, setInput] = useState('');

  function onChange(value) {
    props.onChange({ ...props, value });
  }

  function addTag(tag) {
    tag = tag.trim();
    if (!tag || value.includes(tag)) {
      return;
    }
    onChange([...value, tag]);
  }

  function removeTag(tag) {
    onChange(
      value.filter((v) => {
        return v !== tag;
      }),
    );
  }

  function onKeyDown(evt) {
    if (evt.key === 'Enter') {
      evt.preventDefault();
      addTag(input);
      setInput('');
    } else if (evt.key === 'Backspace' && !input && value.length) {
      removeTag(value[value.length - 1]);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <Label>{label}</Label>}
      {value.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {value.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
              <button
                type="button"
                aria-label={`Remove ${tag}`}
                onClick={() => removeTag(tag)}>
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <Input
        {...rest}
        value={input}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        onChange={(evt) => setInput(evt.target.value)}
        onKeyDown={onKeyDown}
      />
      {error && <p className="text-destructive text-sm">{error.message}</p>}
    </div>
  );
}
