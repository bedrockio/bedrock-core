import { uniqBy } from 'lodash';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

import { useDebounce } from 'hooks/debounce';

import { useSearch } from '../Context';

const defaultGetOptionLabel = (item) => item?.name || item;
const defaultGetOptionValue = (item) => item?.id || item;

export default function SelectFilter(props) {
  const {
    name,
    label,
    data,
    multiple,
    search,
    onDataNeeded,
    placeholder,
    getOptionLabel = defaultGetOptionLabel,
    getOptionValue = defaultGetOptionValue,
  } = props;

  const { filters, setFilters } = useSearch();

  function getDefaultValue() {
    return multiple ? [] : '';
  }

  function getValue() {
    return filters[name] ?? getDefaultValue();
  }

  function setValue(value) {
    setFilters({
      [name]: value,
    });
  }

  if (search || onDataNeeded || multiple) {
    return (
      <Combobox
        name={name}
        label={label}
        data={data}
        multiple={multiple}
        onDataNeeded={onDataNeeded}
        placeholder={placeholder}
        getOptionLabel={getOptionLabel}
        getOptionValue={getOptionValue}
        value={getValue()}
        onChange={setValue}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <Label htmlFor={name}>{label}</Label>}
      <Select value={getValue()} onValueChange={setValue}>
        <SelectTrigger id={name} className="w-full">
          <SelectValue placeholder={placeholder || label} />
        </SelectTrigger>
        <SelectContent>
          {(data || []).map((item) => {
            const value = item.value ?? getOptionValue(item);
            const optionLabel = item.label ?? getOptionLabel(item);
            return (
              <SelectItem key={value} value={value}>
                {optionLabel}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

function Combobox(props) {
  const {
    name,
    label,
    data,
    multiple,
    onDataNeeded,
    placeholder,
    getOptionLabel,
    getOptionValue,
    value,
    onChange,
  } = props;

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  function normalizeData(result) {
    return result?.data || result || [];
  }

  function getOption(item) {
    return {
      value: item.value ?? getOptionValue(item),
      label: item.label ?? getOptionLabel(item),
    };
  }

  function getOptions() {
    return uniqBy([...items, ...selectedItems], (item) => getOption(item).value);
  }

  async function fetch(body) {
    if (onDataNeeded) {
      return normalizeData(await onDataNeeded(body));
    }
    return data || [];
  }

  async function fetchItems(body = {}) {
    setLoading(true);
    try {
      const result = await fetch(body);
      setItems(result);
    } finally {
      setLoading(false);
    }
  }

  const onSearchChange = useDebounce({
    run(keyword) {
      fetchItems(keyword ? { keyword } : {});
    },
    timeout: 200,
    deps: [onDataNeeded, data],
  });

  useEffect(() => {
    if (open && !items.length) {
      fetchItems();
    }
  }, [open]);

  function getSelectedValues() {
    if (multiple) {
      return Array.isArray(value) ? value : [];
    }
    return value ? [value] : [];
  }

  function isSelected(optionValue) {
    return getSelectedValues().includes(optionValue);
  }

  function onSelect(item) {
    const option = getOption(item);
    if (multiple) {
      const current = getSelectedValues();
      const next = current.includes(option.value)
        ? current.filter((v) => v !== option.value)
        : [...current, option.value];
      setSelectedItems((prev) =>
        uniqBy([...prev, item], (i) => getOption(i).value),
      );
      onChange(next);
    } else {
      setSelectedItems([item]);
      onChange(option.value);
      setOpen(false);
    }
  }

  function getLabelForValue(optionValue) {
    const match = getOptions().find(
      (item) => getOption(item).value === optionValue,
    );
    return match ? getOption(match).label : optionValue;
  }

  function renderTriggerContent() {
    const selected = getSelectedValues();
    if (!selected.length) {
      return (
        <span className="text-muted-foreground">
          {placeholder || label || 'Select'}
        </span>
      );
    }
    if (multiple) {
      return (
        <div className="flex flex-wrap gap-1">
          {selected.map((optionValue) => (
            <Badge
              key={optionValue}
              variant="secondary"
              className="gap-1">
              {getLabelForValue(optionValue)}
              <X
                className="size-3 cursor-pointer"
                onClick={(evt) => {
                  evt.stopPropagation();
                  onChange(selected.filter((v) => v !== optionValue));
                }}
              />
            </Badge>
          ))}
        </div>
      );
    }
    return <span>{getLabelForValue(selected[0])}</span>;
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <Label htmlFor={name}>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            id={name}
            className="border-input flex min-h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none">
            {renderTriggerContent()}
            <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command shouldFilter={!onDataNeeded}>
            <CommandInput
              placeholder="Search..."
              onValueChange={onDataNeeded ? onSearchChange : undefined}
            />
            <CommandList>
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Spinner className="size-4" />
                </div>
              ) : (
                <>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {getOptions().map((item) => {
                      const option = getOption(item);
                      return (
                        <CommandItem
                          key={option.value}
                          value={String(option.label)}
                          onSelect={() => onSelect(item)}>
                          <Check
                            className={cn(
                              'size-4',
                              isSelected(option.value)
                                ? 'opacity-100'
                                : 'opacity-0',
                            )}
                          />
                          {option.label}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

SelectFilter.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};
