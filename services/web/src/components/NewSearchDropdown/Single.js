import { useQuery } from '@bedrockio/router';
import { ChevronDown, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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

export default function NewSearchDropdownSingle(props) {
  const { name, value, label, placeholder, useParams, onLoaded } = props;

  function getValue() {
    return value?.id || value || '';
  }

  function getSelectedLabel() {
    const selected = options.find((option) => {
      return option.value === getValue();
    });
    return selected?.label || value?.name || '';
  }

  function onClear(evt) {
    evt?.stopPropagation();
    clearOptions();
    props.onChange(name, null);
    loadOptionsDeferred.cancel();
  }

  function onSearchChange(keyword) {
    if (keyword) {
      if (keyword !== value?.name) {
        loadOptionsDeferred(keyword);
      }
    } else {
      clearOptions();
    }
  }

  function onOptionSubmit(id) {
    const option = options.find((option) => {
      return option.data.id === id;
    });
    if (option) {
      props.onChange(name, option.data);
    }
    setOpen(false);
    loadOptionsDeferred.cancel();
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

  async function loadParams() {
    if (useParams) {
      const id = queryParams[name];
      if (id) {
        const [first] = await runSearch({
          ids: [id],
        });

        if (first) {
          onLoaded?.(first);
          props.onChange(name, first);
        }
      }
    }
  }

  // ----

  const ref = useRef();
  const queryParams = useQuery();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadParams();
  }, []);

  const {
    error,
    loading,
    options,
    runSearch,
    clearOptions,
    loadOptionsDeferred,
  } = useSearchOptions(props);

  const selectedValue = getValue();
  const selectedLabel = getSelectedLabel();

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
              'h-9 w-full justify-between gap-2 font-normal',
              error && 'border-destructive',
            )}>
            <span
              className={cn(
                'flex-1 truncate text-left',
                !selectedValue && 'text-muted-foreground',
              )}>
              {selectedValue ? selectedLabel : placeholder}
            </span>
            {loading ? (
              <Spinner className="size-4" />
            ) : selectedValue ? (
              <X className="size-4 opacity-50" onClick={onClear} />
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
              {!loading && <CommandEmpty>No results</CommandEmpty>}
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => onOptionSubmit(option.data.id)}>
                    <span className="flex-1">{option.label}</span>
                    {selectedValue === option.value && (
                      <X className="size-3 opacity-50" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
