/**
 * Checkbox and RadioGroup Components for UCSC Assessment Hub
 * 
 * Fully accessible form selection components that meet WCAG 2.1 AA standards.
 * 
 * Features:
 * - WCAG 2.1 AA compliant (proper labeling, keyboard navigation)
 * - Checkbox with indeterminate state support
 * - RadioGroup with fieldset/legend grouping
 * - Error state handling
 * - Keyboard accessible (Space to toggle, Arrow keys for radio)
 * - Full TypeScript support
 * 
 * @module Checkbox
 */

import React, { forwardRef, type InputHTMLAttributes } from 'react';

/**
 * Checkbox component props interface
 */
export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Unique identifier for the checkbox */
  id: string;
  
  /** Label text for the checkbox */
  label: string;
  
  /** Error message to display */
  error?: string;
  
  /** Help text to display */
  helpText?: string;
  
  /** Whether the checkbox is in an indeterminate state */
  indeterminate?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * Accessible Checkbox Component
 * 
 * Renders a checkbox input with proper label association and accessibility attributes.
 * 
 * @example
 * ```tsx
 * <Checkbox
 *   id="terms"
 *   label="I agree to the terms and conditions"
 *   required
 *   error={errors.terms}
 * />
 * 
 * <Checkbox
 *   id="notifications"
 *   label="Send me email notifications"
 *   helpText="You can change this later in settings"
 * />
 * ```
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      id,
      label,
      error,
      helpText,
      indeterminate = false,
      className = '',
      disabled = false,
      required = false,
      ...props
    },
    ref
  ) => {
    // Generate IDs
    const errorId = `${id}-error`;
    const helpTextId = `${id}-help`;
    
    const describedBy = [
      error ? errorId : null,
      helpText ? helpTextId : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

    // Set indeterminate state on the input element
    React.useEffect(() => {
      if (ref && typeof ref !== 'function' && ref.current) {
        ref.current.indeterminate = indeterminate;
      }
    }, [indeterminate, ref]);

    const containerClasses = [
      'flex items-start',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const checkboxClasses = [
      'h-5 w-5 rounded',
      'border-2 border-gray-300',
      'text-blue-600',
      'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
      'transition-colors duration-200',
      'disabled:bg-gray-100 disabled:cursor-not-allowed',
      error ? 'border-red-500' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div>
        <div className={containerClasses}>
          <div className="flex items-center h-5">
            <input
              ref={ref}
              id={id}
              type="checkbox"
              className={checkboxClasses}
              disabled={disabled}
              required={required}
              aria-invalid={error ? true : undefined}
              aria-describedby={describedBy}
              aria-required={required}
              {...props}
            />
          </div>
          <div className="ml-3">
            <label
              htmlFor={id}
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              {label}
              {required && (
                <span className="text-red-500 ml-1" aria-label="required">
                  *
                </span>
              )}
            </label>
            
            {helpText && !error && (
              <p id={helpTextId} className="text-sm text-gray-500 mt-1">
                {helpText}
              </p>
            )}
          </div>
        </div>

        {error && (
          <p
            id={errorId}
            className="mt-1 text-sm text-red-600 ml-8"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

/**
 * Radio option interface
 */
export interface RadioOption {
  /** Unique value for the radio option */
  value: string;
  
  /** Label text for the radio option */
  label: string;
  
  /** Whether this option is disabled */
  disabled?: boolean;
  
  /** Help text for this specific option */
  helpText?: string;
}

/**
 * RadioGroup component props interface
 */
export interface RadioGroupProps {
  /** Unique name for the radio group */
  name: string;
  
  /** Legend/title for the radio group */
  legend: string;
  
  /** Array of radio options */
  options: RadioOption[];
  
  /** Currently selected value */
  value?: string;
  
  /** Change handler */
  onChange?: (value: string) => void;
  
  /** Error message to display */
  error?: string;
  
  /** Help text for the entire group */
  helpText?: string;
  
  /** Whether the group is required */
  required?: boolean;
  
  /** Whether to hide the legend visually */
  hideLegend?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * Accessible RadioGroup Component
 * 
 * Renders a group of radio buttons with proper fieldset/legend grouping
 * and keyboard navigation support (arrow keys).
 * 
 * @example
 * ```tsx
 * <RadioGroup
 *   name="role"
 *   legend="Select your role"
 *   options={[
 *     { value: 'student', label: 'Student' },
 *     { value: 'instructor', label: 'Instructor' },
 *     { value: 'staff', label: 'Staff' }
 *   ]}
 *   value={selectedRole}
 *   onChange={setSelectedRole}
 *   required
 * />
 * ```
 */
export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  legend,
  options,
  value,
  onChange,
  error,
  helpText,
  required = false,
  hideLegend = false,
  className = '',
}) => {
  const groupId = `${name}-group`;
  const errorId = `${groupId}-error`;
  const helpTextId = `${groupId}-help`;

  const describedBy = [
    error ? errorId : null,
    helpText ? helpTextId : null,
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  const legendClasses = [
    'block text-sm font-medium text-gray-700 mb-2',
    hideLegend ? 'sr-only' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const fieldsetClasses = [
    'space-y-3',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <fieldset
      className={fieldsetClasses}
      aria-describedby={describedBy}
      aria-invalid={error ? true : undefined}
      aria-required={required}
    >
      <legend className={legendClasses}>
        {legend}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </legend>

      {helpText && !error && (
        <p id={helpTextId} className="text-sm text-gray-500 mb-3">
          {helpText}
        </p>
      )}

      <div className="space-y-3" role="radiogroup">
        {options.map((option) => {
          const optionId = `${name}-${option.value}`;
          const isChecked = value === option.value;

          return (
            <div key={option.value} className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id={optionId}
                  name={name}
                  type="radio"
                  value={option.value}
                  checked={isChecked}
                  disabled={option.disabled}
                  onChange={(e) => onChange?.(e.target.value)}
                  className="h-5 w-5 border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div className="ml-3">
                <label
                  htmlFor={optionId}
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  {option.label}
                </label>
                {option.helpText && (
                  <p className="text-sm text-gray-500 mt-1">
                    {option.helpText}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <p
          id={errorId}
          className="mt-2 text-sm text-red-600"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </fieldset>
  );
};

RadioGroup.displayName = 'RadioGroup';

export default Checkbox;
