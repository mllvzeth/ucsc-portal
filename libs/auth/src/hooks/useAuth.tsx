import {
  AuthError,
  AuthState,
  LoginCredentials,
  Role,
  Session,
  User,
} from '../types/auth.types';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';

const AUTH_STORAGE_KEY = 'ucsc_auth_session_v1';
const AUTH_STORAGE_USER_KEY = 'ucsc_auth_user_v1';

/**
 * Configuration for the UCSC OAuth2/OIDC integration.
 *
 * In Phase 2, these should be injected from environment variables
 * or a configuration service rather than hardcoded.
 */
const OAUTH_CONFIG = {
  authorizeUrl: 'https://my.ucsc.edu', // placeholder for UCSC IdP authorize endpoint
  clientId: 'UCSC_ASSESSMENT_HUB_CLIENT_ID', // placeholder; move to env
};

/**
 * Load a value from localStorage in a defensive, SSR-safe way.
 */
function safeStorageGet(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Persist a value to localStorage in a defensive, SSR-safe way.
 */
function safeStorageSet(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Swallow storage errors (e.g., quota exceeded, private mode)
  }
}

/**
 * Remove a value from localStorage in a defensive, SSR-safe way.
 */
function safeStorageRemove(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Swallow storage errors
  }
}

/**
 * Simulate HttpOnly behavior by never exposing raw token values
 * directly from the hook. Tokens are stored under separate keys and
 * only used by internal helpers / API clients.
 */
function persistSession(session: Session | null, user: User | null): void {
  if (!session || !user) {
    safeStorageRemove(AUTH_STORAGE_KEY);
    safeStorageRemove(AUTH_STORAGE_USER_KEY);
    return;
  }

  // Persist only what is needed on the client. Tokens are stored but
  // should be accessed only by controlled code paths.
  const { token, refreshToken, idToken, ...restSession } = session;

  safeStorageSet(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      ...restSession,
      // Minimal token metadata for expiration checks
      expiresAt: session.expiresAt.toISOString(),
    }),
  );

  safeStorageSet(
    AUTH_STORAGE_USER_KEY,
    JSON.stringify({
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }),
  );
}

/**
 * Rehydrate a Session + User from localStorage.
 *
 * Token values are not rehydrated in this Phase 1 mock implementation;
 * in Phase 2 these would be obtained from secure HttpOnly cookies or
 * a dedicated token endpoint.
 */
function restoreSession(): { session: Session | null; user: User | null } {
  const rawSession = safeStorageGet(AUTH_STORAGE_KEY);
  const rawUser = safeStorageGet(AUTH_STORAGE_USER_KEY);

  if (!rawSession || !rawUser) {
    return { session: null, user: null };
  }

  try {
    const parsedSession = JSON.parse(rawSession) as {
      expiresAt: string;
      sessionId?: string;
      scopes?: string[];
    };

    const parsedUser = JSON.parse(rawUser) as {
      id: string;
      email: string;
      name: string;
      roles: Role[];
      createdAt: string;
      updatedAt: string;
      avatarUrl?: string;
      metadata?: Record<string, unknown>;
    };

    const user: User = {
      ...parsedUser,
      createdAt: new Date(parsedUser.createdAt),
      updatedAt: new Date(parsedUser.updatedAt),
    };

    const session: Session = {
      user,
      token: 'mock_access_token', // placeholder in Phase 1
      refreshToken: 'mock_refresh_token', // placeholder in Phase 1
      idToken: 'mock_id_token', // placeholder in Phase 1
      expiresAt: new Date(parsedSession.expiresAt),
      sessionId: parsedSession.sessionId ?? undefined,
      scopes: parsedSession.scopes ?? ['openid', 'profile', 'email'],
    };

    return { session, user };
  } catch {
    // Corrupted or incompatible data; clear and treat as logged out
    persistSession(null, null);
    return { session: null, user: null };
  }
}

/**
 * Shape of the authentication context provided by AuthProvider.
 */
export interface AuthContextValue extends AuthState {
  /**
   * Initiates the OAuth2/OIDC login redirect flow.
   *
   * @param redirectUrl - Application URL to return to after successful authentication
   */
  login: (redirectUrl: string) => Promise<void> | void;

  /**
   * Logs out the current user, clearing all authentication state.
   */
  logout: () => Promise<void> | void;

  /**
   * Attempts to refresh the current session.
   * In Phase 2, this will call the backend token refresh endpoint.
   */
  refreshSession: () => Promise<void>;

  /**
   * Checks the current session for validity and expiration.
   * Typically called on app bootstrap or route changes.
   */
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Props for the AuthProvider component.
 */
export interface AuthProviderProps {
  children: ReactNode;
  /**
   * Whether to use mock authentication (development only).
   * In production, this should be false and a real backend flow used.
   */
  useMock?: boolean;
}

/**
 * AuthProvider component using React Context to expose authentication state
 * and operations across the UCSC Assessment Hub application.
 *
 * Wrap your application with this provider at the root level.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  useMock = process.env['NODE_ENV'] !== 'production',
}) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    lastRefreshed: null,
  });

  /**
   * Build a standardized AuthError.
   */
  const buildError = useCallback(
    (partial: Pick<AuthError, 'code' | 'message'> & Partial<AuthError>): AuthError => ({
      code: partial.code,
      message: partial.message,
      description: partial.description,
      details: partial.details,
      timestamp: partial.timestamp ?? new Date(),
      requestId: partial.requestId,
    }),
    [],
  );

  /**
   * Mock implementation for login: creates a fake user/session for local development.
   */
  const mockLogin = useCallback(
    async (redirectUrl: string): Promise<void> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Simulate network latency
      await new Promise((resolve) => setTimeout(resolve, 400));

      const now = new Date();
      const user: User = {
        id: 'mock-user-id-123',
        email: 'student@ucsc.edu',
        name: 'Mock Student',
        roles: ['student'],
        createdAt: now,
        updatedAt: now,
        metadata: {
          department: 'Computer Science',
          year: '3',
        },
      };

      const session: Session = {
        user,
        token: 'mock_access_token',
        refreshToken: 'mock_refresh_token',
        idToken: 'mock_id_token',
        expiresAt: new Date(now.getTime() + 60 * 60 * 1000), // 1 hour
        scopes: ['openid', 'profile', 'email'],
        sessionId: 'mock_session_123',
      };

      persistSession(session, user);

      setState({
        user,
        session,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        lastRefreshed: now,
      });

      // For SPA, redirect inside the app if needed
      if (typeof window !== 'undefined' && redirectUrl) {
        window.history.replaceState(null, '', redirectUrl);
      }
    },
    [],
  );

  /**
   * Production login implementation: redirect to UCSC identity provider.
   *
   * Phase 1: constructs an authorization URL and navigates the browser there.
   * Phase 2: integrate with real clientId, scopes, and callback handling.
   */
  const realLogin = useCallback(
    (redirectUrl: string): void => {
      if (typeof window === 'undefined') return;

      const credentials: LoginCredentials = {
        redirectUri: `${window.location.origin}/auth/callback`,
        scopes: ['openid', 'profile', 'email'],
        state: window.btoa(
          JSON.stringify({
            redirectUrl,
            ts: Date.now(),
          }),
        ),
        // PKCE fields would be added in Phase 2
      };

      const params = new URLSearchParams({
        client_id: OAUTH_CONFIG.clientId,
        response_type: 'code',
        redirect_uri: credentials.redirectUri,
        scope: credentials.scopes?.join(' ') ?? 'openid profile email',
        state: credentials.state ?? '',
      });

      const authorizeUrl = `${OAUTH_CONFIG.authorizeUrl}?${params.toString()}`;
      window.location.href = authorizeUrl;
    },
    [],
  );

  const login = useCallback(
    (redirectUrl: string) => {
      if (useMock) {
        return mockLogin(redirectUrl);
      }
      return realLogin(redirectUrl);
    },
    [mockLogin, realLogin, useMock],
  );

  /**
   * Logs out the current user, clearing state and storage.
   */
  const logout = useCallback(async (): Promise<void> => {
    persistSession(null, null);
    setState({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      lastRefreshed: null,
    });
  }, []);

  /**
   * Mock session refresh implementation for development.
   */
  const mockRefreshSession = useCallback(async (): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true }));

    await new Promise((resolve) => setTimeout(resolve, 300));

    setState((prev) => {
      if (!prev.session || !prev.user) {
        return {
          ...prev,
          isLoading: false,
          error: buildError({
            code: 'SESSION_EXPIRED',
            message: 'No active session found.',
          }),
        };
      }

      const now = new Date();
      const updatedSession: Session = {
        ...prev.session,
        expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
      };

      persistSession(updatedSession, prev.user);

      return {
        ...prev,
        session: updatedSession,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        lastRefreshed: now,
      };
    });
  }, [buildError]);

  /**
   * Placeholder for production token refresh.
   * Phase 2: call backend /token/refresh endpoint, update session accordingly.
   */
  const realRefreshSession = useCallback(async (): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true }));
    // TODO: Implement real API-driven refresh in Phase 2.
    setState((prev) => ({
      ...prev,
      isLoading: false,
      error: buildError({
        code: 'UNKNOWN_ERROR',
        message: 'Token refresh is not yet implemented.',
      }),
    }));
  }, [buildError]);

  const refreshSession = useCallback(async (): Promise<void> => {
    if (useMock) {
      return mockRefreshSession();
    }
    return realRefreshSession();
  }, [mockRefreshSession, realRefreshSession, useMock]);

  /**
   * Check current session status and handle expiration.
   */
  const checkSession = useCallback(async (): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true }));

    const { session, user } = restoreSession();

    if (!session || !user) {
      setState((prev) => ({
        ...prev,
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
      }));
      return;
    }

    const now = new Date();
    if (session.expiresAt.getTime() <= now.getTime()) {
      // Token expired; attempt refresh
      await refreshSession();
      return;
    }

    setState((prev) => ({
      ...prev,
      user,
      session,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    }));
  }, [refreshSession]);

  /**
   * On initial mount, restore any existing session from storage.
   */
  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  const value: AuthContextValue = useMemo(
    () => ({
      ...state,
      login,
      logout,
      refreshSession,
      checkSession,
    }),
    [state, login, logout, refreshSession, checkSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to access the current authentication context.
 *
 * Must be used within an AuthProvider tree.
 *
 * @throws Error if used outside AuthProvider
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
