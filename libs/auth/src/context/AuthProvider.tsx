import type React from 'react';
import { 
  createContext, 
  useContext, 
  useEffect, 
  useState, 
  useCallback,
  useMemo,
  type ReactNode 
} from 'react';
import { UserManager, WebStorageStateStore, User as OidcUser, Log } from 'oidc-client-ts';
import type { 
  User, 
  Session, 
  AuthState, 
  AuthError,
  LoginCredentials,
  SessionRefresh,
  Role
} from '../types/auth.types';

// Enable OIDC logging in development
if (typeof import.meta !== 'undefined' && (import.meta as { env?: { DEV?: boolean } }).env?.DEV) {
  Log.setLogger(console);
  Log.setLevel(Log.INFO);
}

/**
 * Authentication context value interface.
 */
export interface AuthContextValue extends AuthState {
  login: (credentials?: Partial<LoginCredentials>) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<SessionRefresh | null>;
  hasRole: (role: string) => boolean;
  handleLoginCallback: () => Promise<void>;
  clearError: () => void;
  updateSession: (session: Session) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
  authority?: string;
  clientId?: string;
  redirectUri?: string;
  onSessionRestored?: (user: User) => void;
  onSessionRestoreFailed?: (error: AuthError) => void;
}

// Map OIDC User to our Domain User
const mapOidcUserToUser = (oidcUser: OidcUser): User => {
  const profile = oidcUser.profile;
  // Extract roles from claims - customize based on your IdP's claim structure
  // Example: realm_access.roles or just 'role' or 'groups'
  const roles = (profile.roles || profile.role || ['student']) as Role[];
  
  return {
    id: profile.sub,
    email: profile.email || '',
    name: profile.name || '',
    roles: Array.isArray(roles) ? roles : [roles],
    createdAt: new Date(profile.auth_time ? profile.auth_time * 1000 : Date.now()),
    updatedAt: new Date(),
    avatarUrl: profile.picture,
  };
};

const mapOidcUserToSession = (oidcUser: OidcUser): Session => {
  return {
    user: mapOidcUserToUser(oidcUser),
    token: oidcUser.access_token,
    refreshToken: oidcUser.refresh_token || '',
    expiresAt: new Date(oidcUser.expires_at! * 1000),
    idToken: oidcUser.id_token,
    scopes: oidcUser.scope?.split(' ') ?? [],
  };
};

// Helper to safely access Vite env vars
const getEnvVar = (key: string, fallback: string): string => {
  if (typeof import.meta !== 'undefined') {
    const env = (import.meta as { env?: Record<string, string> }).env;
    return env?.[key] ?? fallback;
  }
  return fallback;
};

export function AuthProvider({
  children,
  authority = getEnvVar('VITE_OAUTH_AUTHORITY', 'https://auth.ucsc.edu'),
  clientId = getEnvVar('VITE_OAUTH_CLIENT_ID', ''),
  redirectUri = getEnvVar('VITE_OAUTH_REDIRECT_URI', 'http://localhost:3000/auth/callback'),
  onSessionRestored,
  onSessionRestoreFailed,
}: AuthProviderProps): React.JSX.Element {
  
  // Initialize UserManager
  const userManager = useMemo(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    return new UserManager({
      authority,
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid profile email offline_access',
      userStore: new WebStorageStateStore({ store: window.localStorage }),
      automaticSilentRenew: true,
      loadUserInfo: true,
    });
  }, [authority, clientId, redirectUri]);

  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    lastRefreshed: null,
  });

  // Event Handlers
  useEffect(() => {
    if (!userManager) return;

    const onUserLoaded = (oidcUser: OidcUser) => {
      console.log('User loaded:', oidcUser);
      const session = mapOidcUserToSession(oidcUser);
      setState(prev => ({
        ...prev,
        user: session.user,
        session,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }));
      onSessionRestored?.(session.user);
    };

    const onUserUnloaded = () => {
      console.log('User unloaded');
      setState(prev => ({
        ...prev,
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
      }));
    };

    const onAccessTokenExpiring = () => {
      console.log('Token expiring...');
    };

    const onUserSignedOut = () => {
      console.log('User signed out');
      onUserUnloaded();
    };

    const onError = (err: Error) => {
      console.error('OIDC Error:', err);
      setState(prev => ({
        ...prev,
        error: {
          code: 'OIDC_ERROR',
          message: err.message,
          timestamp: new Date()
        }
      }));
    };

    userManager.events.addUserLoaded(onUserLoaded);
    userManager.events.addUserUnloaded(onUserUnloaded);
    userManager.events.addAccessTokenExpiring(onAccessTokenExpiring);
    userManager.events.addUserSignedOut(onUserSignedOut);
    userManager.events.addSilentRenewError(onError);

    // Initial Load
    userManager.getUser().then(user => {
      if (user && !user.expired) {
        onUserLoaded(user);
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    }).catch(err => {
      console.error('Error loading user:', err);
      setState(prev => ({ ...prev, isLoading: false }));
      onSessionRestoreFailed?.({
        code: 'UNKNOWN_ERROR',
        message: 'Failed to restore session'
      });
    });

    return () => {
      userManager.events.removeUserLoaded(onUserLoaded);
      userManager.events.removeUserUnloaded(onUserUnloaded);
      userManager.events.removeAccessTokenExpiring(onAccessTokenExpiring);
      userManager.events.removeUserSignedOut(onUserSignedOut);
      userManager.events.removeSilentRenewError(onError);
    };
  }, [userManager, onSessionRestored, onSessionRestoreFailed]);

  const login = useCallback(async (credentials?: Partial<LoginCredentials>) => {
    if (!userManager) {
      console.error('UserManager not initialized');
      return;
    }
    try {
      await userManager.signinRedirect({
        state: credentials?.state,
        extraQueryParams: credentials?.additionalParams,
      });
    } catch (err) {
      console.error('Login failed:', err);
      setState(prev => ({
        ...prev,
        error: {
          code: 'OAUTH_ERROR',
          message: 'Failed to initiate login',
          details: { error: err }
        }
      }));
    }
  }, [userManager]);

  const logout = useCallback(async () => {
    if (!userManager) {
      return;
    }
    try {
      await userManager.signoutRedirect();
    } catch (err) {
      console.error('Logout failed:', err);
      // Fallback: local cleanup
      await userManager.removeUser();
    }
  }, [userManager]);

  const handleLoginCallback = useCallback(async () => {
    if (!userManager) {
      return;
    }
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await userManager.signinRedirectCallback();
      // State update happens in onUserLoaded event
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      console.error('Callback failed:', err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: {
          code: 'OAUTH_ERROR',
          message: 'Login callback failed',
          details: { error: err }
        }
      }));
      throw err;
    }
  }, [userManager]);

  const refreshSession = useCallback(async () => {
    if (!userManager) {
      return null;
    }
    try {
      const user = await userManager.signinSilent();
      if (user) {
        const session = mapOidcUserToSession(user);
        return {
          token: session.token,
          refreshToken: session.refreshToken,
          expiresAt: session.expiresAt
        };
      }
      return null;
    } catch (err) {
      return null;
    }
  }, [userManager]);

  const hasRole = useCallback((role: string) => {
    return state.user?.roles.includes(role as Role) ?? false;
  }, [state.user]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const contextValue = useMemo(() => ({
    ...state,
    login,
    logout,
    refreshSession,
    hasRole,
    handleLoginCallback,
    clearError,
    // Kept for backward compatibility if needed, but implementation is no-op
    updateSession: (session: Session) => {
      // Manual update not recommended with OIDC, but provided for interface compat
      setState(prev => ({ ...prev, session, user: session.user, isAuthenticated: true }));
    }, 
  }), [state, login, logout, refreshSession, hasRole, handleLoginCallback, clearError]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export default AuthProvider;
