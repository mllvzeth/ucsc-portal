/**
 * ProtectedRoute utilities for TanStack Router
 *
 * This module provides helpers to protect routes using TanStack Router's
 * beforeLoad lifecycle and redirect() function. It supports:
 * - Authentication checks using useAuthContext
 * - Role-based access control with the Role type
 * - Graceful session expiration handling
 * - WCAG 2.1 AA–compliant loading UI with aria-live and aria-busy
 *
 * Usage (in a route file):
 *
 * import { createFileRoute, redirect } from '@tanstack/react-router';
 * import { createProtectedBeforeLoad, ProtectedPending } from '@/libs/auth/src/components/ProtectedRoute';
 *
 * export const Route = createFileRoute('/dashboard')({
 *   pendingComponent: ProtectedPending,
 *   beforeLoad: createProtectedBeforeLoad({
 *     // Optional: restrict to certain roles
 *     roles: ['admin', 'instructor'],
 *   }),
 *   component: DashboardPage,
 * });
 */

import type { ReactElement } from 'react';
import { redirect } from '@tanstack/react-router';
import type { Role } from '../types/auth.types';
import { isAuthError } from '../types/auth.types';

/**
 * Props for configuring a protected route.
 */
export interface ProtectedRouteOptions {
  /**
   * Optional array of roles required to access this route.
   * If provided, the current user must have at least one of these roles.
   */
  roles?: Role[];
}

/**
 * Shape of the router context expected for auth.
 * This should match what you pass via <RouterProvider context={{ auth }} />.
 */
export interface AuthRouterContext {
  auth: {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: { roles: Role[] } | null;
    error: unknown;
  };
}

/**
 * Factory that returns a beforeLoad guard for a protected route.
 *
 * It checks authentication and (optionally) roles from the router context,
 * and redirects unauthenticated or unauthorized users to /login.
 * The current URL is preserved in a `returnUrl` search param for post-login redirect.
 *
 * @param options - Protected route configuration
 * @returns A beforeLoad function suitable for TanStack Router routes
 */
export function createProtectedBeforeLoad(
  options: ProtectedRouteOptions = {},
) {
  return function protectedBeforeLoad(
    ctx: { context: AuthRouterContext; location: { href: string } },
  ): void {
    const { auth } = ctx.context;
    const { location } = ctx;
    const requiredRoles = options.roles;

    // While auth is resolving, let the route show its pendingComponent.
    if (auth.isLoading) {
      return;
    }

    // Handle explicit auth errors (e.g., session expired).
    if (auth.error && isAuthError(auth.error)) {
      // For session-expired-like conditions, force login again.
      throw redirect({
        to: '/login',
        search: {
          returnUrl: location.href,
          reason: auth.error.code,
        },
      });
    }

    // Not authenticated -> redirect to login.
    if (!auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          returnUrl: location.href,
        },
      });
    }

    // Role-based access control if roles were specified.
    if (requiredRoles && requiredRoles.length > 0) {
      const userRoles = auth.user?.roles ?? [];
      const hasRequiredRole = requiredRoles.some((role) =>
        userRoles.includes(role),
      );

      if (!hasRequiredRole) {
        // Treat missing roles as unauthorized; redirect to login with reason.
        throw redirect({
          to: '/login',
          search: {
            returnUrl: location.href,
            reason: 'INSUFFICIENT_PERMISSIONS',
          },
        });
      }
    }

    // If we reach here, access is granted; route loads normally.
  };
}

/**
 * Accessible pending component for protected routes.
 *
 * This component is intended to be used as a route's pendingComponent.
 * It shows a WCAG 2.1 AA–compliant loading state with:
 * - aria-busy to indicate the region is updating
 * - aria-live to announce status changes to assistive tech
 *
 * @returns A React element displaying a loading spinner + message
 *
 * @example
 * export const Route = createFileRoute('/dashboard')({
 *   pendingComponent: ProtectedPending,
 *   beforeLoad: createProtectedBeforeLoad(),
 *   component: DashboardPage,
 * });
 */
export function ProtectedPending(): ReactElement {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="flex min-h-[200px] items-center justify-center"
    >
      <div className="flex flex-col items-center gap-3">
        {/* Replace with your design system spinner if available */}
        <div
          className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-transparent"
          aria-hidden="true"
        />
        <p className="text-sm text-gray-700">
          Checking your authentication status…
        </p>
      </div>
    </div>
  );
}
