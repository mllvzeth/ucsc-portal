/**
 * AuthProvider Context Component for UCSC Assessment Hub
 * 
 * This module provides a production-ready authentication context that wraps the entire
 * application to manage global auth state. It handles session initialization, restoration,
 * validation, and provides auth methods to all child components.
 * 
 * Features:
 * - Automatic session restoration from localStorage on mount
 * - Session expiration validation and auto-refresh
 * - Loading states during auth operations
 * - Error boundary for authentication failures
 * - Type-safe context with comprehensive error handling
 * - Persistent session storage with security considerations
 * 
 * @module AuthProvider
 */

import React, { 
  createContext, 
  useContext, 
  useEffect, 
  useState, 
  useCallback,
  useMemo,
  type ReactNode 
} from 'react';
import type { 
  User, 
  Session, 
  AuthState, 
  AuthError,
  LoginCredentials,
  SessionRefresh 
} from '../types/auth.types';

/**
 * LocalStorage keys for session persistence.
 * Using a namespace to avoid collisions with other apps.
 */
const STORAGE_KEYS = {
  SESSION: 'ucsc_hub_session',
  USER: 'ucsc_hub_user',
  LAST_ACTIVITY: 'ucsc_hub_last_activity',
} as const;

/**
 * Session configuration constants.
 */
const SESSION_CONFIG = {
  /** Time before expiration to trigger refresh (5 minutes in ms) */
  REFRESH_THRESHOLD: 5 * 60 * 1000,
  /** Maximum idle time before auto-logout (30 minutes in ms) */
  MAX_IDLE_TIME: 30 * 60 * 1000,
  /** Interval to check session validity (1 minute in ms) */
  CHECK_INTERVAL: 60 * 1000,
} as const;

/**
 * Authentication context value interface.
 * 
 * Provides auth state and methods to all consuming components.
 * 
 * @interface AuthContextValue
 */
export interface AuthContextValue extends AuthState {
  /**
   * Initiates OAuth2 login flow.
   * Redirects user to identity provider for authentication.
   * 
   * @param credentials - OAuth2 redirect flow credentials
   * @throws {AuthError} If login initiation fails
   * 
   * @example
   * await login({
   *   redirectUri: 'https://hub.ucsc.edu/auth/callback',
   *   scopes: ['openid', 'profile', 'email']
   * });
   */
  login: (credentials: LoginCredentials) => Promise<void>;

  /**
   * Logs out the current user and clears session data.
   * Redirects to logout endpoint and clears local storage.
   * 
   * @throws {AuthError} If logout fails
   * 
   * @example
   * await logout();
   */
  logout: () => Promise<void>;

  /**
   * Refreshes the current session using the refresh token.
   * Should be called before access token expires.
   * 
   * @returns Updated session data
   * @throws {AuthError} If refresh fails
   * 
   * @example
   * const newSession = await refreshSession();
   */
  refreshSession: () => Promise<SessionRefresh>;

  /**
   * Checks if the current user has a specific role.
   * 
   * @param role - The role to check for
   * @returns True if user has the role
   * 
   * @example
   * if (hasRole('admin')) {
   *   // Show admin UI
   * }
   */
  hasRole: (role: string) => boolean;

  /**
   * Updates the current user's session data.
   * Used after successful authentication callback.
   * 
   * @param session - New session data
   * 
   * @example
   * updateSession(newSession);
   */
  updateSession: (session: Session) => void;

  /**
   * Clears any authentication errors.
   * 
   * @example
   * clearError();
   */
  clearError: () => void;
}

/**
 * Authentication context instance.
 * Do not use directly - use useAuthContext hook instead.
 */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Props for the AuthProvider component.
 * 
 * @interface AuthProviderProps
 */
export interface AuthProviderProps {
  /** Child components that need access to auth context */
  children: ReactNode;
  
  /** Optional callback when session is restored */
  onSessionRestored?: (user: User) => void;
  
  /** Optional callback when session restoration fails */
  onSessionRestoreFailed?: (error: AuthError) => void;
  
  /** Optional custom redirect URI for login */
  defaultRedirectUri?: string;
  
  /** Optional flag to disable auto session check (for testing) */
  disableAutoCheck?: boolean;
}

/**
 * Production-ready Authentication Provider Component.
 * 
 * Wraps the entire application to provide authentication state and methods
 * to all child components. Handles session initialization, restoration,
 * validation, and automatic token refresh.
 * 
 * This component should be placed at the root of your application, typically
 * in your main App component or router configuration.
 * 
 * @component
 * 
 * @example
 * ```tsx
 * import { AuthProvider } from '@/libs/auth';
 * 
 * function App() {
 *   return (
 *     <AuthProvider
 *       onSessionRestored={(user) => console.log('Restored:', user)}
 *       onSessionRestoreFailed={(error) => console.error('Failed:', error)}
 *     >
 *       <Router />
 *     </AuthProvider>
 *   );
 * }
 * ```
 */
export function AuthProvider({
  children,
  onSessionRestored,
  onSessionRestoreFailed,
  defaultRedirectUri,
  disableAutoCheck = false,
}: AuthProviderProps): JSX.Element {
  // ============================================================================
  // State Management
  // ============================================================================

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<AuthError | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  // ============================================================================
  // Helper Functions
  // ============================================================================

  /**
   * Safely parses JSON from localStorage with error handling.
   * 
   * @param key - The storage key to retrieve
   * @returns Parsed data or null if not found or invalid
   */
  const getFromStorage = useCallback(<T,>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;
      return JSON.parse(item) as T;
    } catch (err) {
      console.error(`Failed to parse localStorage item: ${key}`, err);
      return null;
    }
  }, []);

  /**
   * Safely stores JSON in localStorage with error handling.
   * 
   * @param key - The storage key to set
   * @param value - The value to store
   */
  const saveToStorage = useCallback(<T,>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`Failed to save to localStorage: ${key}`, err);
      // Set error state if storage quota exceeded
      setError({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to save session data',
        description: 'Local storage may be full or unavailable',
        timestamp: new Date(),
      });
    }
  }, []);

  /**
   * Removes an item from localStorage.
   * 
   * @param key - The storage key to remove
   */
  const removeFromStorage = useCallback((key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.error(`Failed to remove from localStorage: ${key}`, err);
    }
  }, []);

  /**
   * Validates if a session has expired based on its expiration timestamp.
   * Returns true if session is still valid (not expired).
   * 
   * @param sessionData - The session to validate
   * @returns True if session is valid
   */
  const isSessionValid = useCallback((sessionData: Session): boolean => {
    const now = new Date();
    const expiresAt = new Date(sessionData.expiresAt);
    
    // Session is valid if expiration is in the future
    return expiresAt > now;
  }, []);

  /**
   * Checks if session needs refresh based on configured threshold.
   * Returns true if expiration is within REFRESH_THRESHOLD.
   * 
   * @param sessionData - The session to check
   * @returns True if refresh is needed
   */
  const needsRefresh = useCallback((sessionData: Session): boolean => {
    const now = new Date();
    const expiresAt = new Date(sessionData.expiresAt);
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();
    
    return timeUntilExpiry < SESSION_CONFIG.REFRESH_THRESHOLD;
  }, []);

  /**
   * Updates last activity timestamp in localStorage.
   * Used to track idle time and implement auto-logout.
   */
  const updateLastActivity = useCallback((): void => {
    saveToStorage(STORAGE_KEYS.LAST_ACTIVITY, new Date().toISOString());
  }, [saveToStorage]);

  /**
   * Checks if user has been idle for too long.
   * Returns true if MAX_IDLE_TIME has elapsed.
   * 
   * @returns True if user is idle
   */
  const checkIdleTimeout = useCallback((): boolean => {
    const lastActivity = getFromStorage<string>(STORAGE_KEYS.LAST_ACTIVITY);
    if (!lastActivity) return false;

    const lastActivityDate = new Date(lastActivity);
    const now = new Date();
    const idleTime = now.getTime() - lastActivityDate.getTime();

    return idleTime > SESSION_CONFIG.MAX_IDLE_TIME;
  }, [getFromStorage]);

  /**
   * Clears all authentication data from state and storage.
   * This is a complete cleanup used during logout or session expiration.
   */
  const clearAuthData = useCallback((): void => {
    setUser(null);
    setSession(null);
    setLastRefreshed(null);
    removeFromStorage(STORAGE_KEYS.SESSION);
    removeFromStorage(STORAGE_KEYS.USER);
    removeFromStorage(STORAGE_KEYS.LAST_ACTIVITY);
  }, [removeFromStorage]);

  /**
   * Creates a standardized AuthError object.
   * 
   * @param code - The error code
   * @param message - Human-readable error message
   * @param details - Optional additional error context
   * @returns Formatted AuthError
   */
  const createAuthError = useCallback((
    code: AuthError['code'],
    message: string,
    details?: Record<string, unknown>
  ): AuthError => {
    return {
      code,
      message,
      details,
      timestamp: new Date(),
    };
  }, []);

  // ============================================================================
  // Core Authentication Methods
  // ============================================================================

  /**
   * Initiates the OAuth2/OIDC login flow.
   * Redirects to the identity provider for authentication.
   */
  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Implement OAuth2 redirect logic
      // This would typically construct the authorization URL and redirect
      // For now, this is a placeholder that would be implemented with your OAuth provider
      
      const authUrl = new URL('https://auth.ucsc.edu/oauth2/authorize');
      authUrl.searchParams.set('client_id', process.env.REACT_APP_OAUTH_CLIENT_ID || '');
      authUrl.searchParams.set('redirect_uri', credentials.redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', credentials.scopes?.join(' ') || 'openid profile email');
      
      if (credentials.state) {
        authUrl.searchParams.set('state', credentials.state);
      }
      
      if (credentials.nonce) {
        authUrl.searchParams.set('nonce', credentials.nonce);
      }

      // Redirect to OAuth provider
      window.location.href = authUrl.toString();
    } catch (err) {
      const authError = createAuthError(
        'OAUTH_ERROR',
        'Failed to initiate login',
        { error: err }
      );
      setError(authError);
      throw authError;
    } finally {
      setIsLoading(false);
    }
  }, [createAuthError]);

  /**
   * Logs out the current user and clears all session data.
   * Redirects to logout endpoint if configured.
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Call logout endpoint if your backend requires it
      // This would typically revoke tokens on the server
      
      // Clear all auth data
      clearAuthData();

      // Optional: Redirect to OAuth provider logout endpoint
      // window.location.href = 'https://auth.ucsc.edu/oauth2/logout';
      
    } catch (err) {
      const authError = createAuthError(
        'UNKNOWN_ERROR',
        'Logout failed',
        { error: err }
      );
      setError(authError);
      throw authError;
    } finally {
      setIsLoading(false);
    }
  }, [clearAuthData, createAuthError]);

  /**
   * Refreshes the current session using the refresh token.
   * Automatically called when session is about to expire.
   */
  const refreshSession = useCallback(async (): Promise<SessionRefresh> => {
    try {
      if (!session?.refreshToken) {
        throw createAuthError(
          'REFRESH_TOKEN_INVALID',
          'No refresh token available'
        );
      }

      setIsLoading(true);
      setError(null);

      // TODO: Implement token refresh API call
      // This would typically POST to your token refresh endpoint
      // For now, this is a placeholder
      
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: session.refreshToken,
        }),
      });

      if (!response.ok) {
        throw createAuthError(
          'REFRESH_TOKEN_INVALID',
          'Failed to refresh session',
          { status: response.status }
        );
      }

      const refreshData: SessionRefresh = await response.json();
      
      // Update session with new tokens
      const updatedSession: Session = {
        ...session,
        token: refreshData.token,
        refreshToken: refreshData.refreshToken,
        expiresAt: refreshData.expiresAt,
      };

      setSession(updatedSession);
      saveToStorage(STORAGE_KEYS.SESSION, updatedSession);
      setLastRefreshed(new Date());
      updateLastActivity();

      return refreshData;
    } catch (err) {
      const authError = err instanceof Error && 'code' in err
        ? err as AuthError
        : createAuthError(
            'REFRESH_TOKEN_INVALID',
            'Session refresh failed',
            { error: err }
          );
      
      setError(authError);
      
      // If refresh fails, clear session and force re-login
      clearAuthData();
      
      throw authError;
    } finally {
      setIsLoading(false);
    }
  }, [session, createAuthError, clearAuthData, saveToStorage, updateLastActivity]);

  /**
   * Updates the session after successful authentication.
   * Called from the OAuth callback handler.
   */
  const updateSession = useCallback((newSession: Session): void => {
    setSession(newSession);
    setUser(newSession.user);
    saveToStorage(STORAGE_KEYS.SESSION, newSession);
    saveToStorage(STORAGE_KEYS.USER, newSession.user);
    setLastRefreshed(new Date());
    updateLastActivity();
    setError(null);

    // Call optional callback
    onSessionRestored?.(newSession.user);
  }, [saveToStorage, updateLastActivity, onSessionRestored]);

  /**
   * Checks if the current user has a specific role.
   */
  const hasRole = useCallback((role: string): boolean => {
    return user?.roles.includes(role as any) ?? false;
  }, [user]);

  /**
   * Clears any authentication errors.
   */
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  // ============================================================================
  // Session Initialization & Restoration
  // ============================================================================

  /**
   * Attempts to restore session from localStorage on mount.
   * Validates session expiration and triggers refresh if needed.
   */
  const restoreSession = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);

      // Check for idle timeout
      if (checkIdleTimeout()) {
        throw createAuthError(
          'SESSION_EXPIRED',
          'Session expired due to inactivity'
        );
      }

      // Retrieve stored session
      const storedSession = getFromStorage<Session>(STORAGE_KEYS.SESSION);
      const storedUser = getFromStorage<User>(STORAGE_KEYS.USER);

      if (!storedSession || !storedUser) {
        // No stored session - user needs to log in
        return;
      }

      // Convert date strings back to Date objects
      const sessionWithDates: Session = {
        ...storedSession,
        expiresAt: new Date(storedSession.expiresAt),
        user: {
          ...storedUser,
          createdAt: new Date(storedUser.createdAt),
          updatedAt: new Date(storedUser.updatedAt),
        },
      };

      // Check if session is expired
      if (!isSessionValid(sessionWithDates)) {
        throw createAuthError(
          'SESSION_EXPIRED',
          'Your session has expired. Please log in again.'
        );
      }

      // Restore session
      setSession(sessionWithDates);
      setUser(sessionWithDates.user);
      updateLastActivity();

      // Trigger refresh if needed
      if (needsRefresh(sessionWithDates)) {
        await refreshSession();
      }

      // Call optional callback
      onSessionRestored?.(sessionWithDates.user);
      
    } catch (err) {
      const authError = err instanceof Error && 'code' in err
        ? err as AuthError
        : createAuthError(
            'UNKNOWN_ERROR',
            'Failed to restore session',
            { error: err }
          );

      setError(authError);
      clearAuthData();
      
      // Call optional callback
      onSessionRestoreFailed?.(authError);
      
      console.error('Session restoration failed:', authError);
    } finally {
      setIsLoading(false);
    }
  }, [
    checkIdleTimeout,
    getFromStorage,
    isSessionValid,
    needsRefresh,
    refreshSession,
    clearAuthData,
    updateLastActivity,
    createAuthError,
    onSessionRestored,
    onSessionRestoreFailed,
  ]);

  /**
   * Periodic session validation check.
   * Runs every CHECK_INTERVAL to validate session and check for refresh needs.
   */
  const checkSession = useCallback(async (): Promise<void> => {
    if (!session || isLoading) return;

    try {
      // Check idle timeout
      if (checkIdleTimeout()) {
        setError(createAuthError(
          'SESSION_EXPIRED',
          'Session expired due to inactivity'
        ));
        clearAuthData();
        return;
      }

      // Check if session expired
      if (!isSessionValid(session)) {
        setError(createAuthError(
          'SESSION_EXPIRED',
          'Your session has expired. Please log in again.'
        ));
        clearAuthData();
        return;
      }

      // Check if refresh needed
      if (needsRefresh(session)) {
        await refreshSession();
      }
    } catch (err) {
      console.error('Session check failed:', err);
    }
  }, [
    session,
    isLoading,
    checkIdleTimeout,
    isSessionValid,
    needsRefresh,
    refreshSession,
    clearAuthData,
    createAuthError,
  ]);

  // ============================================================================
  // Effects
  // ============================================================================

  /**
   * Initialize auth state on component mount.
   * Attempts to restore session from localStorage.
   */
  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  /**
   * Set up periodic session validation checks.
   * Runs every minute to ensure session is still valid.
   */
  useEffect(() => {
    if (disableAutoCheck) return;

    const intervalId = setInterval(() => {
      checkSession();
    }, SESSION_CONFIG.CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, [checkSession, disableAutoCheck]);

  /**
   * Track user activity to prevent idle timeout.
   * Updates last activity timestamp on user interaction.
   */
  useEffect(() => {
    if (!session) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    const handleActivity = (): void => {
      updateLastActivity();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [session, updateLastActivity]);

  // ============================================================================
  // Context Value
  // ============================================================================

  /**
   * Memoized context value to prevent unnecessary re-renders.
   */
  const contextValue = useMemo<AuthContextValue>(() => ({
    user,
    session,
    isAuthenticated: !!user && !!session,
    isLoading,
    error,
    lastRefreshed,
    login,
    logout,
    refreshSession,
    hasRole,
    updateSession,
    clearError,
  }), [
    user,
    session,
    isLoading,
    error,
    lastRefreshed,
    login,
    logout,
    refreshSession,
    hasRole,
    updateSession,
    clearError,
  ]);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// Custom Hook
// ============================================================================

/**
 * Custom hook to access authentication context.
 * 
 * This hook provides type-safe access to the authentication context and
 * ensures the component is rendered within an AuthProvider. It should be
 * used by all components that need access to authentication state or methods.
 * 
 * @returns Authentication context value
 * @throws {Error} If used outside of AuthProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, isAuthenticated, logout } = useAuthContext();
 *   
 *   if (!isAuthenticated) {
 *     return <div>Please log in</div>;
 *   }
 *   
 *   return (
 *     <div>
 *       <h1>Welcome, {user.name}!</h1>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error(
      'useAuthContext must be used within an AuthProvider. ' +
      'Ensure your component tree is wrapped with <AuthProvider>.'
    );
  }
  
  return context;
}

// ============================================================================
// Exports
// ============================================================================

export default AuthProvider;
