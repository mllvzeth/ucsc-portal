/**
 * Button Component for UCSC Assessment Hub
 * 
 * A fully accessible button component that meets WCAG 2.1 AA standards.
 * Provides multiple variants, sizes, and states with proper focus indicators,
 * color contrast ratios, and minimum touch target sizes.
 * 
 * Features:
 * - WCAG 2.1 AA compliant (4.5:1 contrast ratio, 44x44px minimum touch target)
 * - Keyboard accessible (focus indicators, Enter/Space activation)
 * - Loading and disabled states
 * - Icon support (leading and trailing)
 * - Full TypeScript support
 * 
 * @module Button
 */

import React, { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

/**
 * Button variant types defining visual styles
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';

/**
 * Button size types defining dimensions
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Button component props interface
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant of the button */
  variant?: ButtonVariant;
  
  /** Size of the button */
  size?: ButtonSize;
  
  /** Whether the button is in a loading state */
  isLoading?: boolean;
  
  /** Icon to display before the button text */
  leftIcon?: ReactNode;
  
  /** Icon to display after the button text */
  rightIcon?: ReactNode;
  
  /** Whether the button should take full width of its container */
  fullWidth?: boolean;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Button content */
  children: ReactNode;
}

/**
 * Returns Tailwind CSS classes for the button based on variant
 */
const getVariantClasses = (variant: ButtonVariant): string => {
  const variants: Record<ButtonVariant, string> = {
    primary: [
      'bg-blue-600 text-white',
      'hover:bg-blue-700',
      'focus-visible:ring-blue-500',
      'active:bg-blue-800',
      'disabled:bg-gray-300 disabled:text-gray-500',
    ].join(' '),
    
    secondary: [
      'bg-gray-600 text-white',
      'hover:bg-gray-700',
      'focus-visible:ring-gray-500',
      'active:bg-gray-800',
      'disabled:bg-gray-300 disabled:text-gray-500',
    ].join(' '),
    
    outline: [
      'bg-transparent text-blue-600 border-2 border-blue-600',
      'hover:bg-blue-50',
      'focus-visible:ring-blue-500',
      'active:bg-blue-100',
      'disabled:border-gray-300 disabled:text-gray-400 disabled:bg-transparent',
    ].join(' '),
    
    danger: [
      'bg-red-600 text-white',
      'hover:bg-red-700',
      'focus-visible:ring-red-500',
      'active:bg-red-800',
      'disabled:bg-gray-300 disabled:text-gray-500',
    ].join(' '),
    
    ghost: [
      'bg-transparent text-gray-700',
      'hover:bg-gray-100',
      'focus-visible:ring-gray-500',
      'active:bg-gray-200',
      'disabled:text-gray-400 disabled:bg-transparent',
    ].join(' '),
  };
  
  return variants[variant];
};

/**
 * Returns Tailwind CSS classes for the button based on size
 * Ensures minimum 44x44px touch target for WCAG AA compliance
 */
const getSizeClasses = (size: ButtonSize): string => {
  const sizes: Record<ButtonSize, string> = {
    sm: 'min-h-[44px] px-4 py-2 text-sm',
    md: 'min-h-[44px] px-6 py-3 text-base',
    lg: 'min-h-[48px] px-8 py-4 text-lg',
  };
  
  return sizes[size];
};

/**
 * Accessible Button Component
 * 
 * Renders a button element with proper accessibility attributes,
 * keyboard support, and visual feedback for all states.
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={() => console.log('clicked')}>
 *   Submit
 * </Button>
 * 
 * <Button variant="outline" leftIcon={<Icon />} isLoading>
 *   Loading...
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      children,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Combine all CSS classes
    const buttonClasses = [
      // Base styles
      'inline-flex items-center justify-center gap-2',
      'font-semibold rounded-lg',
      'transition-all duration-200',
      'cursor-pointer',
      
      // Focus styles (WCAG 2.1 AA - 2px visible focus indicator)
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      
      // Disabled styles
      'disabled:cursor-not-allowed disabled:opacity-60',
      
      // Variant and size specific styles
      getVariantClasses(variant),
      getSizeClasses(size),
      
      // Full width option
      fullWidth ? 'w-full' : '',
      
      // Custom classes
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        type={type}
        className={buttonClasses}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        aria-disabled={disabled || isLoading}
        {...props}
      >
        {/* Loading spinner */}
        {isLoading && (
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        
        {/* Left icon */}
        {!isLoading && leftIcon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        
        {/* Button text */}
        <span>{children}</span>
        
        {/* Right icon */}
        {!isLoading && rightIcon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
