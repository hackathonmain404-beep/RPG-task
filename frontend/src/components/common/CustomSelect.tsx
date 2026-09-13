import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import './custom-select.css';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  color?: string;
  badge?: string;
  description?: string;
}

export interface CustomSelectProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  ariaLabel?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'default' | 'gold' | 'cyan' | 'purple';
}

export function CustomSelect<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  ariaLabel,
  id,
  disabled = false,
  className = '',
  style,
  variant = 'default',
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Dismiss dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(prev => !prev);
    }
  };

  const handleSelect = useCallback((optValue: T) => {
    onChange(optValue);
    setIsOpen(false);
    triggerRef.current?.focus();
  }, [onChange]);

  return (
    <div
      ref={containerRef}
      className={`rpg-custom-select-container ${className}`}
      style={style}
    >
      {/* Hidden Accessible <select> for Testing & Assistive Tools */}
      <select
        id={id}
        aria-label={ariaLabel || placeholder}
        value={value}
        onChange={e => onChange(e.target.value as T)}
        disabled={disabled}
        tabIndex={-1}
        className="rpg-custom-select-accessible-hidden"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Styled Interactive Trigger */}
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={handleToggle}
        className={`rpg-custom-select-trigger variant-${variant} ${isOpen ? 'is-open' : ''}`}
      >
        <div className="rpg-custom-select-trigger-content">
          {selectedOption?.icon && (
            <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
              {selectedOption.icon}
            </span>
          )}
          {selectedOption?.color && (
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: selectedOption.color,
                boxShadow: `0 0 6px ${selectedOption.color}`,
                flexShrink: 0,
              }}
            />
          )}
          <span style={{ color: selectedOption ? 'inherit' : 'var(--text-tertiary)' }}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--text-secondary)',
                marginLeft: 'auto',
                marginRight: '0.35rem',
              }}
            >
              {selectedOption.badge}
            </span>
          )}
        </div>
        <ChevronDown size={15} className="rpg-custom-select-chevron" />
      </button>

      {/* Custom Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-label={ariaLabel || placeholder}
          className={`rpg-custom-select-menu variant-${variant}`}
        >
          {options.map(opt => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                className={`rpg-custom-select-option ${isSelected ? 'is-selected' : ''}`}
              >
                <div className="rpg-custom-select-option-content">
                  {opt.icon && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
                      {opt.icon}
                    </span>
                  )}
                  {opt.color && (
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: opt.color,
                        boxShadow: `0 0 6px ${opt.color}`,
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <span>{opt.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {opt.badge && (
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '6px',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {opt.badge}
                    </span>
                  )}
                  {isSelected && <Check size={14} color={variant === 'gold' ? '#fbbf24' : '#38bdf8'} />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
