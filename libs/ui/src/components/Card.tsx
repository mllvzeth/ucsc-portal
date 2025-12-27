/**
 * Card Component for UCSC Assessment Hub
 * 
 * A flexible container component for grouping related content.
 * Provides optional header, body, and footer sections with consistent
 * styling and responsive behavior.
 * 
 * Features:
 * - Semantic HTML structure
 * - Responsive padding and spacing
 * - Shadow and border styling
 * - Optional sections (header, footer)
 * - Full TypeScript support
 * 
 * @module Card
 */

import React, { type HTMLAttributes, type ReactNode } from 'react';

/**
 * Card component props interface
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Additional CSS classes for the card container */
  className?: string;
  
  /** Card content */
  children: ReactNode;
  
  /** Whether to add hover effect */
  hoverable?: boolean;
  
  /** Whether to add border */
  bordered?: boolean;
}

/**
 * CardHeader component props interface
 */
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Additional CSS classes */
  className?: string;
  
  /** Header content */
  children: ReactNode;
}

/**
 * CardBody component props interface
 */
export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  /** Additional CSS classes */
  className?: string;
  
  /** Body content */
  children: ReactNode;
}

/**
 * CardFooter component props interface
 */
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  /** Additional CSS classes */
  className?: string;
  
  /** Footer content */
  children: ReactNode;
}

/**
 * Card Container Component
 * 
 * Main container for card content with optional styling enhancements.
 * 
 * @example
 * ```tsx
 * <Card hoverable>
 *   <CardHeader>
 *     <h2>Card Title</h2>
 *   </CardHeader>
 *   <CardBody>
 *     <p>Card content goes here</p>
 *   </CardBody>
 *   <CardFooter>
 *     <Button>Action</Button>
 *   </CardFooter>
 * </Card>
 * ```
 */
export const Card: React.FC<CardProps> = ({
  className = '',
  children,
  hoverable = false,
  bordered = true,
  ...props
}) => {
  const cardClasses = [
    // Base styles
    'bg-white rounded-lg overflow-hidden',
    
    // Shadow
    'shadow-md',
    
    // Border
    bordered ? 'border border-gray-200' : '',
    
    // Hover effect
    hoverable ? 'transition-shadow duration-200 hover:shadow-lg' : '',
    
    // Custom classes
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

/**
 * Card Header Component
 * 
 * Optional header section for the card, typically containing titles or actions.
 * 
 * @example
 * ```tsx
 * <CardHeader>
 *   <h2 className="text-xl font-semibold">Assessment Details</h2>
 * </CardHeader>
 * ```
 */
export const CardHeader: React.FC<CardHeaderProps> = ({
  className = '',
  children,
  ...props
}) => {
  const headerClasses = [
    'px-6 py-4',
    'border-b border-gray-200',
    'bg-gray-50',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={headerClasses} {...props}>
      {children}
    </div>
  );
};

/**
 * Card Body Component
 * 
 * Main content area of the card with responsive padding.
 * 
 * @example
 * ```tsx
 * <CardBody>
 *   <p>This is the main content of the card.</p>
 * </CardBody>
 * ```
 */
export const CardBody: React.FC<CardBodyProps> = ({
  className = '',
  children,
  ...props
}) => {
  const bodyClasses = [
    'px-6 py-4',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={bodyClasses} {...props}>
      {children}
    </div>
  );
};

/**
 * Card Footer Component
 * 
 * Optional footer section for actions or additional information.
 * 
 * @example
 * ```tsx
 * <CardFooter>
 *   <div className="flex justify-end gap-2">
 *     <Button variant="outline">Cancel</Button>
 *     <Button variant="primary">Submit</Button>
 *   </div>
 * </CardFooter>
 * ```
 */
export const CardFooter: React.FC<CardFooterProps> = ({
  className = '',
  children,
  ...props
}) => {
  const footerClasses = [
    'px-6 py-4',
    'border-t border-gray-200',
    'bg-gray-50',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={footerClasses} {...props}>
      {children}
    </div>
  );
};

// Set display names for better debugging
Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardBody.displayName = 'CardBody';
CardFooter.displayName = 'CardFooter';

export default Card;
