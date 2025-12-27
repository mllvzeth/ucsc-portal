/**
 * Input Component for UCSC Assessment Hub
 * 
 * A fully accessible form input component that meets WCAG 2.1 AA standards.
 * Provides proper label association, error handling, and help text support.
 * 
 * Features:
 * - WCAG 2.1 AA compliant (proper labeling, error announcements)
 * - Multiple input types (text, email, password, number, tel, url)
 * - Label association with htmlFor
 * - Error state with aria-invalid and aria-describedby
 * - Help text support
 * - Password visibility toggle
 * - Full TypeScript support
 * 
 * @module Input
 */

import React, { forwardRef, useState, type InputHTMLAttributes } from 'react';

/**
 * Input type variants
 */
export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';

/**
 * Input component props interface
 */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Unique identifier for the input (required for accessibility) */
  id: string;
  
  /** Label text for the input */
  label: string;
  
  /** Input type */
  type?: InputType;
  
  /** Error message to display */
  error?: string;
  
  /** Help text to display below the input */
  helpText?: string;
  
  /** Whether to hide the label visually (still accessible to screen readers) */
  hideLabel?: boolean;
  
  /** Additional CSS classes for the input container */
  className?: string;
  
  /** Additional CSS classes for the input element */
  inputClassName?: string;
  
  /** Whether the input is required */
  required?: boolean;
}

/**
 * Accessible Input Component
 * 
 * Renders a form input with proper label association, error handling,
 * and accessibility attributes.
 * 
 * @example
 * ```tsx
 * <Input
 *   id="email"
 *   label="Email Address"
 *   type="email"
 *   required
 *   error={errors.email}
 *   helpText="We'll never share your email"
 * />
 * 
 * <Input
 *   id="password"
 *   label="Password"
 *   type="password"
 *   required
 * />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      label,
      type = 'text',
      error,
      helpText,
      hideLabel = false,
      className = '',
      inputClassName = '',
      required = false,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [inputType, setInputType] = useState(type);

    // Generate IDs for error and help text
    const errorId = `${id}-error`;
    const helpTextId = `${id}-help`;
    
    // Determine aria-describedby
    const describedBy = [
      error ? errorId : null,
      helpText ? helpTextId : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

    // Toggle password visibility
    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
      setInputType(showPassword ? 'password' : 'text');
    };

    // Input container classes
    const containerClasses = [
      'w-full',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // Label classes
    const labelClasses = [
      'block text-sm font-medium text-gray-700 mb-1',
      hideLabel ? 'sr-only' : '',
    ]
      .filter(Boolean)
      .join(' ');

    // Input classes
    const inputClasses = [
      // Base styles
      'block w-full rounded-md shadow-sm',
      'px-4 py-2',
      'text-base text-gray-900',
      'placeholder-gray-400',
      'transition-colors duration-200',
      
      // Border and focus styles
      error
        ? 'border-2 border-red-500 focus:border-red-600 focus:ring-red-500'
        : 'border border-gray-300 focus:border-blue-500 focus:ring-blue-500',
      
      // Focus ring (WCAG 2.1 AA)
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      
      // Disabled state
      'disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed',
      
      // Custom classes
      inputClassName,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={containerClasses}>
        {/* Label */}
        <label htmlFor={id} className={labelClasses}>
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>

        {/* Input wrapper (for password toggle) */}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={type === 'password' ? inputType : type}
            className={inputClasses}
            disabled={disabled}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            aria-required={required}
            {...props}
          />

          {/* Password visibility toggle */}
          {type === 'password' && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={0}
            >
              {showPassword ? (
                // Eye slash icon (hidden)
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              ) : (
                // Eye icon (visible)
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p
            id={errorId}
            className="mt-1 text-sm text-red-600"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}

        {/* Help text */}
        {helpText && !error && (
          <p id={helpTextId} className="mt-1 text-sm text-gray-500">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
