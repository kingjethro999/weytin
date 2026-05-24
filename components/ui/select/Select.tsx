'use client';

import * as React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  /** Options rendered in the dropdown list. */
  options: SelectOption[];
  /** Controlled value. */
  value?: string;
  /** Default value for uncontrolled usage. */
  defaultValue?: string;
  /** Called when the selected value changes. */
  onChange?: (value: string) => void;
  /** Placeholder shown when no option is selected. */
  placeholder?: string;
  /** Matches the native <select> `name` for form submission. */
  name?: string;
  /** Marks the field as required in a form context. */
  required?: boolean;
  /** Disables the entire control. */
  disabled?: boolean;
  /** Additional class names applied to the trigger button. */
  className?: string;
  /** Unique id for label association. */
  id?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      options,
      value: controlledValue,
      defaultValue,
      onChange,
      placeholder = 'Select an option',
      name,
      required,
      disabled,
      className,
      id,
    },
    ref
  ) => {
    const isControlled = controlledValue !== undefined;

    const [internalValue, setInternalValue] = React.useState<string>(
      defaultValue ?? ''
    );
    const [open, setOpen] = React.useState(false);
    const [focusedIndex, setFocusedIndex] = React.useState<number>(-1);

    const value = isControlled ? controlledValue : internalValue;
    const selectedOption = options.find((o) => o.value === value);

    const triggerRef = React.useRef<HTMLButtonElement | null>(null);
    const listboxRef = React.useRef<HTMLUListElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Merge external ref with internal trigger ref
    const setTriggerRef = React.useCallback(
      (node: HTMLButtonElement | null) => {
        triggerRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      },
      [ref]
    );

    // ── Helpers ──────────────────────────────────────────────────────────────

    const enabledOptions = options.filter((o) => !o.disabled);

    const selectValue = React.useCallback(
      (newValue: string) => {
        if (!isControlled) setInternalValue(newValue);
        onChange?.(newValue);
        setOpen(false);
        triggerRef.current?.focus();
      },
      [isControlled, onChange]
    );

    // ── Effects ──────────────────────────────────────────────────────────────

    // Focus the active item in the list when open
    React.useEffect(() => {
      if (open) {
        const idx = options.findIndex((o) => o.value === value);
        setFocusedIndex(idx >= 0 ? idx : 0);
      }
    }, [open, options, value]);

    React.useEffect(() => {
      if (open && listboxRef.current) {
        const item = listboxRef.current.querySelector<HTMLElement>(
          `[data-index="${focusedIndex}"]`
        );
        item?.scrollIntoView({ block: 'nearest' });
      }
    }, [open, focusedIndex]);

    // Close on outside click
    React.useEffect(() => {
      if (!open) return;
      const handler = (e: MouseEvent) => {
        if (!containerRef.current?.contains(e.target as Node)) {
          setOpen(false);
        }
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    // ── Keyboard ─────────────────────────────────────────────────────────────

    const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      switch (e.key) {
        case 'Enter':
        case ' ':
        case 'ArrowDown':
          e.preventDefault();
          setOpen(true);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setOpen(true);
          break;
        case 'Escape':
          setOpen(false);
          break;
      }
    };

    const handleListKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          setFocusedIndex((prev) => {
            let next = prev + 1;
            while (next < options.length && options[next].disabled) next++;
            return next < options.length ? next : prev;
          });
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          setFocusedIndex((prev) => {
            let next = prev - 1;
            while (next >= 0 && options[next].disabled) next--;
            return next >= 0 ? next : prev;
          });
          break;
        }
        case 'Enter':
        case ' ': {
          e.preventDefault();
          const opt = options[focusedIndex];
          if (opt && !opt.disabled) selectValue(opt.value);
          break;
        }
        case 'Escape':
        case 'Tab': {
          setOpen(false);
          triggerRef.current?.focus();
          break;
        }
        case 'Home': {
          e.preventDefault();
          const first = options.findIndex((o) => !o.disabled);
          if (first >= 0) setFocusedIndex(first);
          break;
        }
        case 'End': {
          e.preventDefault();
          const last = [...options].reverse().findIndex((o) => !o.disabled);
          if (last >= 0) setFocusedIndex(options.length - 1 - last);
          break;
        }
      }
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
      <div ref={containerRef} className="relative w-full">
        {/* Hidden native input for form submission */}
        {name && (
          <input
            type="hidden"
            name={name}
            value={value}
            required={required}
            aria-hidden="true"
          />
        )}

        {/* Trigger */}
        <button
          ref={setTriggerRef}
          id={id}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-required={required}
          aria-disabled={disabled}
          disabled={disabled}
          onClick={() => setOpen((prev) => !prev)}
          onKeyDown={handleTriggerKeyDown}
          className={cn(
            // Base
            'flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm',
            // Typography
            'text-left',
            // States
            'transition-colors',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            // Open indicator
            open && 'ring-1 ring-ring',
            // Placeholder colour
            !selectedOption && 'text-muted-foreground',
            className
          )}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={cn(
              'size-4 shrink-0 text-muted-foreground transition-transform duration-150',
              open && 'rotate-180'
            )}
          />
        </button>

        {/* Dropdown */}
        {open && (
          <ul
            ref={listboxRef}
            role="listbox"
            aria-label={placeholder}
            tabIndex={-1}
            onKeyDown={handleListKeyDown}
            // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
            className={cn(
              // Position
              'absolute z-50 mt-1 w-full',
              // Appearance
              'rounded-md border border-border bg-popover shadow-md',
              // Scroll
              'max-h-60 overflow-y-auto',
              // Animate in
              'animate-in fade-in-0 zoom-in-95'
            )}
            // Auto-focus the list so keyboard events land here
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            autoFocus
          >
            {options.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">
                No options available
              </li>
            ) : (
              options.map((option, index) => {
                const isFocused = index === focusedIndex;
                const isSelected = option.value === value;

                return (
                  <li
                    key={option.value}
                    role="option"
                    data-index={index}
                    aria-selected={isSelected}
                    aria-disabled={option.disabled}
                    onMouseEnter={() => !option.disabled && setFocusedIndex(index)}
                    onClick={() => !option.disabled && selectValue(option.value)}
                    className={cn(
                      'flex cursor-pointer items-center justify-between px-3 py-2 text-sm select-none',
                      'transition-colors',
                      // Hover / focus highlight
                      isFocused && !option.disabled && 'bg-accent text-accent-foreground',
                      // Selected
                      isSelected && 'font-medium text-foreground',
                      // Disabled
                      option.disabled && 'cursor-not-allowed opacity-40'
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && (
                      <Check className="size-3.5 shrink-0 text-primary" />
                    )}
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';

export { Select };
