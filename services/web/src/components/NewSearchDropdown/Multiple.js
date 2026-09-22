import { ChevronDown, X } from 'lucide-react';
import { useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

import useSearchOptions from './useSearchOptions';

export default function NewSearchDropdownMultiple(props) {
  const { name, value, label, placeholder } = props;

  function getValue() {
    return value.map((obj) => {
      return obj.id || obj;
    });
  }

  function onSearchChange(keyword) {
    if (keyword) {
      loadOptionsDeferred(keyword);
    }
  }

  function onChange(ids) {
    const docs = options
      .filter((option) => {
        return ids.includes(option.data.id);
      })
      .map((option) => {
        return option.data;
      });

    props.onChange(name, docs);
    loadOptionsDeferred.cancel();
  }

  function onToggle(id) {
    const ids = getValue();
    const next = ids.includes(id)
      ? ids.filter((existing) => existing !== id)
      : [...ids, id];
    onChange(next);
  }

  function removeItem(id, evt) {
    evt?.stopPropagation();
    onChange(getValue().filter((existing) => existing !== id));
  }

  function onKeyDown(evt) {
    if (evt.key === 'Enter') {
      const { value: keyword } = evt.target;
      evt.preventDefault();
      evt.stopPropagation();
      runSearch({
        keyword,
      });
    }
  }

  function renderNothingFound() {
    if (loading) {
      return 'Loading...';
    } else {
      return 'No results';
    }
  }

  // ----

  const ref = useRef();
  const [open, setOpen] = useState(false);

  const { error, loading, options, runSearch, loadOptionsDeferred } =
    useSearchOptions(props);

  const ids = getValue();
  const selectedOptions = ids.map((id) => {
    const populated = value.find((obj) => (obj.id || obj) === id);
    const option = options.find((opt) => opt.value === id);
    return {
      value: id,
      label: option?.label || populated?.name || id,
    };
  });

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium">{label}</label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            type="button"
            variant="outline"
            aria-invalid={!!error}
            className={cn(
              'h-auto min-h-9 w-full justify-between gap-2 font-normal',
              error && 'border-destructive',
            )}>
            <div className="flex flex-1 flex-wrap items-center gap-1">
              {selectedOptions.length ? (
                selectedOptions.map((opt) => (
                  <Badge key={opt.value} variant="secondary" className="gap-1">
                    {opt.label}
                    <X
                      className="size-3 cursor-pointer"
                      onClick={(evt) => removeItem(opt.value, evt)}
                    />
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            {loading ? (
              <Spinner className="size-4" />
            ) : (
              <ChevronDown className="size-4 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={placeholder}
              onValueChange={onSearchChange}
              onKeyDown={onKeyDown}
            />
            <CommandList>
              {!loading && <CommandEmpty>{renderNothingFound()}</CommandEmpty>}
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = ids.includes(option.data.id);
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => onToggle(option.data.id)}>
                      <span className="flex-1">{option.label}</span>
                      {isSelected && <X className="size-3 opacity-50" />}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
