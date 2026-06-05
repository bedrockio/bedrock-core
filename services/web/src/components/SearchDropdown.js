import { debounce, isEmpty, uniqBy } from 'lodash';
import { ChevronDown, X } from 'lucide-react';
import PropTypes from 'prop-types';
import React from 'react';

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

import { request } from 'utils/api';

function isValueObject(props) {
  if (props.value && !isEmpty(props.value)) {
    return Array.isArray(props.value)
      ? typeof props.value[0] === 'object'
      : typeof props.value === 'object';
  } else {
    return props.objectMode;
  }
}

export default class SearchDropdown extends React.Component {
  state = {
    items: [],
    selectedItems: [],
    loading: false,
    error: null,
    open: false,
    objectMode: isValueObject(this.props),
  };

  componentDidMount() {
    if (this.props.value) {
      this.fetchSelectedItems();
    }
  }

  fetch = async (body) => {
    if (this.props.onDataNeeded) {
      return this.props.onDataNeeded(body);
    }

    return await request({
      method: 'POST',
      path: this.props.searchPath,
      body: {
        ...body,
        ...this.props.searchBody,
      },
    });
  };

  async fetchSelectedItems() {
    const { value } = this.props;
    if (Array.isArray(value) && !value.length) {
      return;
    }
    try {
      const selected = await this.fetch({
        ids: (Array.isArray(value) ? value : [value]).map((item) =>
          this.props.getOptionValue(item),
        ),
      });

      this.setState({
        loading: false,
        selectedItems: selected.data || selected,
      });
    } catch (e) {
      this.setState({
        error: e,
        loading: false,
      });
    }
  }

  async fetchItems(query) {
    this.setState({
      loading: true,
      error: null,
    });
    try {
      const items = await this.fetch(query);
      this.setState({
        items: items.data || items,
        loading: false,
      });
    } catch (error) {
      this.setState({
        error,
        loading: false,
      });
    }
  }

  onSearchChange = debounce((searchQuery) => {
    const options = {};
    if (searchQuery) {
      options[this.props.keywordField] = searchQuery;
    }
    this.fetchItems(options);
  }, 200);

  onChange = (value) => {
    const ids = Array.isArray(value) ? value : [value];
    const items = this.getAllItems();
    const selected = ids.map((id) => {
      return items.find((item) => item.id === id);
    });

    if (!this.state.objectMode) {
      return this.props.onChange(value);
    }

    value = this.props.multiple ? selected : selected[0];
    this.props.onChange(value);
  };

  onFocus = () => {
    if (!this.state.items.length) {
      this.fetchItems();
    }
  };

  getAllItems() {
    return uniqBy([...this.state.items, ...this.state.selectedItems], 'id');
  }

  getSelectedItems() {
    const { value } = this.props;
    if (Array.isArray(value)) {
      return value;
    } else if (value) {
      return [value];
    } else {
      return [];
    }
  }

  getOptions() {
    return this.getAllItems().map((item) => {
      const { getOptionLabel, getOptionValue } = this.props;
      const value = getOptionValue(item);
      return {
        id: value,
        key: value,
        label: getOptionLabel(item),
        value: value,
      };
    });
  }

  getValue() {
    const { multiple, value } = this.props;
    if (multiple) {
      return (value?.length ? value : []).map((obj) => obj.id || obj);
    } else {
      return value?.id || value || '';
    }
  }

  setOpen = (open) => {
    this.setState({ open });
    if (open) {
      this.onFocus();
    }
  };

  onItemSelect = (optionValue) => {
    const { multiple } = this.props;
    if (multiple) {
      const current = this.getValue();
      const next = current.includes(optionValue)
        ? current.filter((id) => id !== optionValue)
        : [...current, optionValue];
      this.onChange(next);
    } else {
      this.onChange(optionValue);
      this.setState({ open: false });
    }
  };

  removeItem = (optionValue, evt) => {
    evt?.stopPropagation();
    const current = this.getValue();
    this.onChange(current.filter((id) => id !== optionValue));
  };

  renderTrigger(options, selectedValues) {
    const { multiple, placeholder } = this.props;

    if (multiple) {
      const selectedOptions = selectedValues.map((id) => {
        return (
          options.find((opt) => opt.value === id) || {
            value: id,
            label: id,
          }
        );
      });
      return (
        <div className="flex min-h-9 flex-1 flex-wrap items-center gap-1">
          {selectedOptions.length ? (
            selectedOptions.map((opt) => (
              <Badge key={opt.value} variant="secondary" className="gap-1">
                {opt.label}
                <X
                  className="size-3 cursor-pointer"
                  onClick={(evt) => this.removeItem(opt.value, evt)}
                />
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>
      );
    }

    const selected = options.find((opt) => opt.value === selectedValues);
    return (
      <span
        className={cn(
          'flex-1 truncate text-left',
          !selected && 'text-muted-foreground',
        )}>
        {selected ? selected.label : placeholder}
      </span>
    );
  }

  render() {
    const { loading, error, open } = this.state;
    const { label, fluid, disabled, required } = this.props;

    const options = this.getOptions();
    const value = this.getValue();

    return (
      <div className={cn('flex flex-col gap-1.5', fluid && 'w-full')}>
        {label && (
          <label className="text-sm font-medium">
            {label}
            {required && <span className="text-destructive"> *</span>}
          </label>
        )}
        <Popover open={open} onOpenChange={this.setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              aria-invalid={!!error}
              className={cn(
                'h-auto min-h-9 w-full justify-between gap-2 font-normal',
                error && 'border-destructive',
              )}>
              {this.renderTrigger(options, value)}
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
                placeholder="Search..."
                onValueChange={this.onSearchChange}
              />
              <CommandList>
                {!loading && <CommandEmpty>No results</CommandEmpty>}
                <CommandGroup>
                  {options.map((option) => {
                    const isSelected = Array.isArray(value)
                      ? value.includes(option.value)
                      : value === option.value;
                    return (
                      <CommandItem
                        key={option.key}
                        value={option.value}
                        onSelect={() => this.onItemSelect(option.value)}>
                        <span
                          className={cn('flex-1', isSelected && 'font-medium')}>
                          {option.label}
                        </span>
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
}

const propTypeShape = {
  objectMode: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  getOptionLabel: PropTypes.func,
  getOptionValue: PropTypes.func,
};

SearchDropdown.propTypes = PropTypes.oneOfType([
  PropTypes.shape({
    ...propTypeShape,
    onDataNeeded: PropTypes.func.isRequired,
  }),
  PropTypes.shape({
    ...propTypeShape,
    searchPath: PropTypes.string.isRequired,
    searchBody: PropTypes.object,
  }),
]).isRequired;

SearchDropdown.defaultProps = {
  keywordField: 'keyword',
  // TODO: why is this default?
  objectMode: true,
  getOptionLabel: (item) => item?.name || item,
  getOptionValue: (item) => item?.id || item,
};
