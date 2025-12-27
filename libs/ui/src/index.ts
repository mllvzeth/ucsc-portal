/**
 * UI Library Barrel Exports for UCSC Assessment Hub
 * 
 * Central export point for all UI components, hooks, and utilities.
 * Import components and hooks from this file using path aliases.
 * 
 * @module @ucsc-hub/ui
 * 
 * @example
 * ```tsx
 * import { Button, Input, Card } from '@/ui';
 * import { useFocusManagement, useKeyboardNav } from '@/ui';
 * ```
 */

// ============================================================================
// Components
// ============================================================================

export {
  Button,
  type ButtonProps,
  type ButtonVariant,
  type ButtonSize,
} from './components/Button';

export {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  type CardProps,
  type CardHeaderProps,
  type CardBodyProps,
  type CardFooterProps,
} from './components/Card';

export {
  Input,
  type InputProps,
  type InputType,
} from './components/Input';

export {
  Checkbox,
  RadioGroup,
  type CheckboxProps,
  type RadioGroupProps,
  type RadioOption,
} from './components/Checkbox';

// ============================================================================
// Hooks
// ============================================================================

export {
  useFocusManagement,
  useFocusOnMount,
  type UseFocusManagementOptions,
} from './hooks/useFocusManagement';

export {
  useKeyboardNav,
  useRovingTabIndex,
  type UseKeyboardNavOptions,
  type UseKeyboardNavReturn,
  type NavigationOrientation,
} from './hooks/useKeyboardNav';
