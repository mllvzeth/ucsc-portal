/**
 * useFocusManagement Hook for UCSC Assessment Hub
 * 
 * A custom React hook for managing focus in modal dialogs and other
 * interactive components. Implements focus trap and auto-focus patterns
 * for WCAG 2.1 AA compliance.
 * 
 * Features:
 * - Focus trap for modals (prevents Tab outside dialog)
 * - Auto-focus on open
 * - Restore focus on close
 * - Escape key to close
 * - Keyboard navigation support
 * 
 * @module useFocusManagement
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * Options for the useFocusManagement hook
 */
export interface UseFocusManagementOptions {
  /** Whether the focus trap is active */
  isActive: boolean;
  
  /** Callback when Escape key is pressed */
  onEscape?: () => void;
  
  /** Whether to auto-focus the first focusable element */
  autoFocus?: boolean;
  
  /** Whether to restore focus to the trigger element on close */
  restoreFocus?: boolean;
}

/**
 * Returns all focusable elements within a container
 */
const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors));
};

/**
 * Custom hook for managing focus within a container (e.g., modal dialog)
 * 
 * Provides focus trap functionality, keyboard navigation, and focus restoration.
 * 
 * @param options - Configuration options for focus management
 * @returns Ref to attach to the container element
 * 
 * @example
 * ```tsx
 * function Modal({ isOpen, onClose }) {
 *   const modalRef = useFocusManagement({
 *     isActive: isOpen,
 *     onEscape: onClose,
 *     autoFocus: true,
 *     restoreFocus: true,
 *   });
 * 
 *   if (!isOpen) return null;
 * 
 *   return (
 *     <div ref={modalRef} role="dialog" aria-modal="true">
 *       <h2>Modal Title</h2>
 *       <button onClick={onClose}>Close</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useFocusManagement(options: UseFocusManagementOptions) {
  const {
    isActive,
    onEscape,
    autoFocus = true,
    restoreFocus = true,
  } = options;

  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  /**
   * Handle Tab key navigation to trap focus within container
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!containerRef.current) return;

      // Handle Escape key
      if (event.key === 'Escape' && onEscape) {
        event.preventDefault();
        onEscape();
        return;
      }

      // Handle Tab key for focus trap
      if (event.key === 'Tab') {
        const focusableElements = getFocusableElements(containerRef.current);
        
        if (focusableElements.length === 0) {
          // No focusable elements, prevent tabbing
          event.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const activeElement = document.activeElement as HTMLElement;

        // Shift + Tab (backward)
        if (event.shiftKey) {
          if (activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        }
        // Tab (forward)
        else {
          if (activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    },
    [onEscape]
  );

  // Set up focus trap when active
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store the currently focused element to restore later
    if (restoreFocus && document.activeElement) {
      previousActiveElementRef.current = document.activeElement as HTMLElement;
    }

    // Auto-focus first focusable element
    if (autoFocus) {
      const focusableElements = getFocusableElements(containerRef.current);
      if (focusableElements.length > 0) {
        // Small delay to ensure element is rendered
        setTimeout(() => {
          focusableElements[0].focus();
        }, 10);
      }
    }

    // Add keydown listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Restore focus to previous element
      if (restoreFocus && previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
        previousActiveElementRef.current = null;
      }
    };
  }, [isActive, autoFocus, restoreFocus, handleKeyDown]);

  return containerRef;
}

/**
 * Simple hook to move focus to a specific element
 * 
 * @param elementId - ID of the element to focus
 * 
 * @example
 * ```tsx
 * function ErrorSummary({ errors }) {
 *   useFocusOnMount('error-summary');
 * 
 *   return (
 *     <div id="error-summary" tabIndex={-1}>
 *       <h2>Please correct the following errors:</h2>
 *       <ul>
 *         {errors.map(error => <li key={error}>{error}</li>)}
 *       </ul>
 *     </div>
 *   );
 * }
 * ```
 */
export function useFocusOnMount(elementId: string) {
  useEffect(() => {
    const element = document.getElementById(elementId);
    if (element) {
      // Small delay to ensure element is rendered
      setTimeout(() => {
        element.focus();
      }, 10);
    }
  }, [elementId]);
}

export default useFocusManagement;
