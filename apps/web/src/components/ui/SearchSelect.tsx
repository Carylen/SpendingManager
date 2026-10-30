'use client';

import { useId, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { Icon } from './Icon';

export interface SelectOption {
  value: string;
  label: string;
  group: string;
  description?: string;
}

interface SearchSelectProps {
  label: string;
  placeholder: string;
  emptyLabel: string;
  options: SelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  multi?: boolean;
  hideLabel?: boolean;
  describedBy?: string;
}

const ALL_TAB = 'Semua';
const PANEL_WIDTH = 320;
const EDGE = 12;

function Highlighted({ text, query }: { text: string; query: string }) {
  const at = query ? text.toLowerCase().indexOf(query) : -1;
  if (at < 0) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, at)}
      <mark className="ar-combo__mark">{text.slice(at, at + query.length)}</mark>
      {text.slice(at + query.length)}
    </span>
  );
}

export function SearchSelect({
  label,
  placeholder,
  emptyLabel,
  options,
  value,
  onChange,
  multi = false,
  hideLabel = false,
  describedBy,
}: SearchSelectProps) {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState(ALL_TAB);
  const [highlight, setHighlight] = useState(0);
  const [placement, setPlacement] = useState({ left: 0, width: PANEL_WIDTH });

  const groups = useMemo(() => [...new Set(options.map((option) => option.group))], [options]);
  const needle = query.trim().toLowerCase();
  const visible = useMemo(
    () =>
      groups.flatMap((group) =>
        options.filter(
          (option) =>
            option.group === group &&
            (tab === ALL_TAB || option.group === tab) &&
            (!needle || option.label.toLowerCase().includes(needle)),
        ),
      ),
    [groups, options, tab, needle],
  );
  const active = Math.min(highlight, Math.max(0, visible.length - 1));
  const selectedLabels = value.map(
    (selected) => options.find((option) => option.value === selected)?.label ?? selected,
  );
  const summary =
    selectedLabels.length === 0
      ? emptyLabel
      : selectedLabels.length <= 2
        ? selectedLabels.join(', ')
        : `${selectedLabels[0]} +${selectedLabels.length - 1}`;

  const close = () => {
    setOpen(false);
    setQuery('');
    triggerRef.current?.focus();
  };

  const toggleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    if (open) return close();
    const rect = event.currentTarget.getBoundingClientRect();
    const width = Math.min(PANEL_WIDTH, window.innerWidth - EDGE * 2);
    const overflow = window.innerWidth - EDGE - (rect.left + width);
    setPlacement({ width, left: Math.max(Math.min(0, overflow), EDGE - rect.left) });
    setQuery('');
    setTab(ALL_TAB);
    setHighlight(0);
    setOpen(true);
  };

  const pick = (optionValue: string) => {
    if (!multi) {
      onChange(value[0] === optionValue ? [] : [optionValue]);
      close();
      return;
    }
    onChange(
      value.includes(optionValue)
        ? value.filter((item) => item !== optionValue)
        : [...value, optionValue],
    );
  };

  const onSearchKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') setHighlight(Math.min(active + 1, visible.length - 1));
    else if (event.key === 'ArrowUp') setHighlight(Math.max(active - 1, 0));
    else if (event.key === 'Enter' && visible[active]) pick(visible[active].value);
    else if (event.key === 'Escape') close();
    else return;
    event.preventDefault();
  };

  return (
    <div className="ar-combo" data-open={open}>
      <button
        ref={triggerRef}
        type="button"
        className="ar-combo__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-describedby={describedBy}
        data-active={value.length > 0}
        onClick={toggleOpen}
      >
        {!hideLabel && <span className="ar-combo__key">{label}</span>}
        <span className="ar-combo__value">{summary}</span>
        <Icon name="chevronDown" className="ar-chev" />
      </button>
      {open && (
        <>
          <button type="button" className="ar-veil" aria-label="Tutup pilihan" onClick={close} />
          <div className="ar-combo__pop" style={{ left: placement.left, width: placement.width }}>
            <label className="ar-input ar-combo__search">
              <Icon name="search" />
              <input
                className="ar-input__control"
                type="search"
                placeholder={placeholder}
                aria-label={placeholder}
                aria-controls={`${id}-list`}
                aria-activedescendant={
                  visible[active] ? `${id}-${visible[active].value}` : undefined
                }
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setHighlight(0);
                }}
                onKeyDown={onSearchKey}
                autoFocus
              />
            </label>
            {groups.length > 1 && (
              <div className="ar-combo__tabs" role="group" aria-label="Kelompok">
                {[ALL_TAB, ...groups].map((name) => (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={tab === name}
                    onClick={() => {
                      setTab(name);
                      setHighlight(0);
                    }}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
            <div
              id={`${id}-list`}
              className="ar-combo__list"
              role="listbox"
              aria-label={label}
              aria-multiselectable={multi}
            >
              {groups.map((group) => {
                const items = visible.filter((option) => option.group === group);
                if (items.length === 0) return null;
                const allSelected = items.every((option) => value.includes(option.value));
                const values = items.map((option) => option.value);
                return (
                  <div key={group} role="presentation">
                    <div className="ar-combo__group" role="presentation">
                      <span>{group}</span>
                      {multi && items.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            onChange(
                              allSelected
                                ? value.filter((item) => !values.includes(item))
                                : [...value, ...values.filter((item) => !value.includes(item))],
                            )
                          }
                        >
                          {allSelected ? 'Kosongkan' : 'Pilih semua'}
                        </button>
                      )}
                    </div>
                    {items.map((option) => {
                      const index = visible.indexOf(option);
                      return (
                        <button
                          key={option.value}
                          id={`${id}-${option.value}`}
                          type="button"
                          role="option"
                          className="ar-combo__opt"
                          aria-selected={value.includes(option.value)}
                          data-highlighted={index === active}
                          onClick={() => pick(option.value)}
                          onMouseEnter={() => setHighlight(index)}
                        >
                          <span
                            className={['ar-combo__box', !multi && 'ar-combo__box--radio']
                              .filter(Boolean)
                              .join(' ')}
                          >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path d="m5 12 5 5 9-10" />
                            </svg>
                          </span>
                          <Highlighted text={option.label} query={needle} />
                          {option.description && (
                            <span className="ar-combo__tag">{option.description}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
              {visible.length === 0 && (
                <div className="ar-combo__empty">Tidak ada yang cocok dengan “{query.trim()}”</div>
              )}
            </div>
            {multi && (
              <div className="ar-pop__foot">
                <span className="ar-hint">
                  {value.length ? `${value.length} dipilih` : 'Belum ada yang dipilih'}
                </span>
                <button
                  type="button"
                  className="ar-btn ar-btn--sm ar-btn--ghost"
                  onClick={() => onChange([])}
                >
                  Reset
                </button>
                <button type="button" className="ar-btn ar-btn--sm ar-btn--primary" onClick={close}>
                  Selesai
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
