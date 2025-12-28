/**
 * useKeyboardNav Hook for UCSC Assessment Hub
 * 
 * A custom React hook for implementing keyboard navigation patterns
 * in lists, menus, and other interactive components. Supports arrow
 * key navigation for WCAG 2.1 AA compliance.
 * 
 * Features:
 * - Arrow key navigation (Up/Down, Left/Right)
 * - Home/End key support
 * - Circular navigation option
 * - Customizable key handlers
 * - Orientation support (vertical/horizontal)
 * 
 * @module useKeyboardNav
 */

import { useState, useCallback, useEffect, type KeyboardEvent } from 'react';

/**
 * Navigation orientation
 */
export type NavigationOrientation = 'vertical' | 'horizontal' | 'both';

/**
 * Options for the useKeyboardNav hook
 */
export interface UseKeyboardNavOptions {
  /** Number of items in the list */
  itemCount: number;
  
  /** Initial focused index */
  initialIndex?: number;
  
  /** Navigation orientation */
  orientation?: NavigationOrientation;
  
  /** Whether navigation should wrap around (circular) */
  circular?: boolean;
  
  /** Callback when the focused index changes */
  onIndexChange?: (index: number) => void;
  
  /** Callback when Enter key is pressed on an item */
  onSelect?: (index: number) => void;
}

/**
 * Return type for useKeyboardNav hook
 */
export interface UseKeyboardNavReturn {
  /** Current focused index */
  focusedIndex: number;
  
  /** Set the focused index */
  setFocusedIndex: (index: number) => void;
  
  /** Key down handler to attach to the container */
  handleKeyDown: (event: KeyboardEvent) => void;
  
  /** Helper to get props for an item at a specific index */
  getItemProps: (index: number) => {
    tabIndex: number;
    'aria-selected': boolean;
    onFocus: () => void;
  };
}

/**
 * Custom hook for implementing keyboard navigation in lists and menus
 * 
 * Handles arrow key navigation, Home/End keys, and provides helpers
 * for managing focus state.
 * 
 * @param options - Configuration options for keyboard navigation
 * @returns Navigation state and handlers
 * 
 * @example
 * ```tsx
 * function Menu({ items }) {
 *   const { focusedIndex, handleKeyDown, getItemProps } = useKeyboardNav({
 *     itemCount: items.length,
 *     orientation: 'vertical',
 *     circular: true,
 *     onSelect: (index) => console.log('Selected:', items[index]),
 *   });
 * 
 *   return (
 *     <ul role="menu" onKeyDown={handleKeyDown}>
 *       {items.map((item, index) => (
 *         <li
 *           key={index}
 *           role="menuitem"
 *           {...getItemProps(index)}
 *         >
 *           {item.label}
 *         </li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useKeyboardNav(
  options: UseKeyboardNavOptions
): UseKeyboardNavReturn {
  const {
    itemCount,
    initialIndex = -1,
    orientation = 'vertical',
    circular = false,
    onIndexChange,
    onSelect,
  } = options;

  const [focusedIndex, setFocusedIndex] = useState(initialIndex);

  /**
   * Move focus to a specific index with boundary checks
   */
  const moveFocus = useCallback(
    (newIndex: number) => {
      let nextIndex = newIndex;

      if (circular) {
        // Wrap around for circular navigation
        if (nextIndex < 0) {
          nextIndex = itemCount - 1;
        } else if (nextIndex >= itemCount) {
          nextIndex = 0;
        }
      } else {
        // Clamp to boundaries for non-circular navigation
        nextIndex = Math.max(0, Math.min(itemCount - 1, nextIndex));
      }

      setFocusedIndex(nextIndex);
      onIndexChange?.(nextIndex);
    },
    [itemCount, circular, onIndexChange]
  );

  /**
   * Handle keyboard events for navigation
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const { key } = event;

      // Determine if we should handle this key based on orientation
      const shouldHandleVertical =
        orientation === 'vertical' || orientation === 'both';
      const shouldHandleHorizontal =
        orientation === 'horizontal' || orientation === 'both';

      let handled = false;

      // Arrow Up or Arrow Left
      if (
        (key === 'ArrowUp' && shouldHandleVertical) ||
        (key === 'ArrowLeft' && shouldHandleHorizontal)
      ) {
        event.preventDefault();
        moveFocus(focusedIndex - 1);
        handled = true;
      }

      // Arrow Down or Arrow Right
      if (
        (key === 'ArrowDown' && shouldHandleVertical) ||
        (key === 'ArrowRight' && shouldHandleHorizontal)
      ) {
        event.preventDefault();
        moveFocus(focusedIndex + 1);
        handled = true;
      }

      // Home key - move to first item
      if (key === 'Home') {
        event.preventDefault();
        moveFocus(0);
        handled = true;
      }

      // End key - move to last item
      if (key === 'End') {
        event.preventDefault();
        moveFocus(itemCount - 1);
        handled = true;
      }

      // Enter or Space - select current item
      if (key === 'Enter' || key === ' ') {
        if (focusedIndex >= 0 && focusedIndex < itemCount) {
          event.preventDefault();
          onSelect?.(focusedIndex);
          handled = true;
        }
      }

      return handled;
    },
    [focusedIndex, orientation, itemCount, moveFocus, onSelect]
  );

  /**
   * Get props for an item at a specific index
   * Provides tabIndex and aria-selected for proper accessibility
   */
  const getItemProps = useCallback(
    (index: number) => ({
      tabIndex: index === focusedIndex ? 0 : -1,
      'aria-selected': index === focusedIndex,
      onFocus: () => {
        if (index !== focusedIndex) {
          setFocusedIndex(index);
          onIndexChange?.(index);
        }
      },
    }),
    [focusedIndex, onIndexChange]
  );

  return {
    focusedIndex,
    setFocusedIndex: moveFocus,
    handleKeyDown,
    getItemProps,
  };
}

/**
 * Simple hook for handling roving tabindex pattern
 * 
 * Useful for toolbars and tab lists where only one item should be tabbable.
 * 
 * @param itemCount - Number of items in the list
 * @param initialIndex - Initial focused index (default: 0)
 * @returns Current index and setter
 * 
 * @example
 * ```tsx
 * function Toolbar({ tools }) {
 *   const [activeIndex, setActiveIndex] = useRovingTabIndex(tools.length);
 * 
 *   return (
 *     <div role="toolbar">
 *       {tools.map((tool, index) => (
 *         <button
 *           key={index}
 *           tabIndex={index === activeIndex ? 0 : -1}
 *           onFocus={() => setActiveIndex(index)}
 *         >
 *           {tool.label}
 *         </button>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useRovingTabIndex(
  itemCount: number,
  initialIndex: number = 0
): [number, (index: number) => void] {
  const [activeIndex, setActiveIndex] = useState(
    Math.max(0, Math.min(initialIndex, itemCount - 1))
  );

  // Update active index if itemCount changes and current index is out of bounds
  useEffect(() => {
    if (activeIndex >= itemCount) {
      setActiveIndex(Math.max(0, itemCount - 1));
    }
  }, [itemCount, activeIndex]);

  return [activeIndex, setActiveIndex];
}

export default useKeyboardNav;
