/**
 * Authentication Types for UCSC Assessment Hub
 * 
 * This module provides comprehensive TypeScript types for OAuth2/OIDC authentication
 * in the UCSC Assessment Hub. It includes user management, session handling, and
 * authentication state management with strict typing for enterprise production use.
 * 
 * @module auth.types
 */

/**
 * User role types within the UCSC Assessment Hub system.
 * 
 * @typedef {string} Role
 * - `student`: Regular student with access to assessments and submissions
 * - `instructor`: Faculty member with course management and grading capabilities
 * - `admin`: System administrator with full access to all resources
 * - `staff`: Administrative staff with limited management capabilities
 * 
 * @example
 * const userRole: Role = 'instructor';
 */
export type Role = 'student' | 'instructor' | 'admin' | 'staff';

/**
 * Core user entity representing an authenticated user in the system.
 * 
 * This interface defines the structure of user data retrieved from the OAuth2/OIDC
 * identity provider and stored in the application state. All user-related operations
 * should reference this interface for type safety.
 * 
 * @interface User
 * 
 * @property {string} id - Unique identifier for the user (UUID from identity provider)
 * @property {string} email - User's verified email address (primary authentication identifier)
 * @property {string} name - User's full display name
 * @property {Role[]} roles - Array of roles assigned to the user (supports multiple roles)
 * @property {Date} createdAt - Timestamp when the user account was created
 * @property {Date} updatedAt - Timestamp of the last user profile update
 * @property {string} [avatarUrl] - Optional URL to user's profile picture
 * @property {Record<string, unknown>} [metadata] - Optional key-value pairs for additional user data
 * 
 * @example
 * const user: User = {
 *   id: '123e4567-e89b-12d3-a456-426614174000',
 *   email: 'student@ucsc.edu',
 *   name: 'John Doe',
 *   roles: ['student'],
 *   createdAt: new Date('2024-01-15'),
 *   updatedAt: new Date('2024-12-20'),
 *   avatarUrl: 'https://example.com/avatar.jpg',
 *   metadata: { department: 'Computer Science', year: '3' }
 * };
 */
export interface User {
  /** Unique identifier for the user (UUID from identity provider) */
  id: string;
  
  /** User's verified email address (primary authentication identifier) */
  email: string;
  
  /** User's full display name */
  name: string;
  
  /** Array of roles assigned to the user (supports multiple roles) */
  roles: Role[];
  
  /** Timestamp when the user account was created */
  createdAt: Date;
  
  /** Timestamp of the last user profile update */
  updatedAt: Date;
  
  /** Optional URL to user's profile picture */
  avatarUrl?: string;
  
  /** Optional key-value pairs for additional user data (e.g., department, year) */
  metadata?: Record<string, unknown>;
}

/**
 * Authentication session containing user data and JWT tokens.
 * 
 * Represents an active authentication session after successful OAuth2/OIDC login.
 * This interface manages the lifecycle of authenticated sessions including token
 * refresh and expiration. Sessions are typically stored in secure HTTP-only cookies
 * or encrypted local storage.
 * 
 * @interface Session
 * 
 * @property {User} user - The authenticated user's complete profile data
 * @property {string} token - JWT access token for API authentication (Bearer token)
 * @property {string} refreshToken - JWT refresh token for obtaining new access tokens
 * @property {Date} expiresAt - Timestamp when the access token expires (UTC)
 * @property {string} [idToken] - Optional OIDC ID token containing user claims
 * @property {string[]} [scopes] - Optional OAuth2 scopes granted to this session
 * @property {string} [sessionId] - Optional unique identifier for this session instance
 * 
 * @example
 * const session: Session = {
 *   user: currentUser,
 *   token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
 *   refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
 *   expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
 *   idToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
 *   scopes: ['openid', 'profile', 'email'],
 *   sessionId: 'sess_abc123xyz'
 * };
 */
export interface Session {
  /** The authenticated user's complete profile data */
  user: User;
  
  /** JWT access token for API authentication (Bearer token) */
  token: string;
  
  /** JWT refresh token for obtaining new access tokens */
  refreshToken: string;
  
  /** Timestamp when the access token expires (UTC) */
  expiresAt: Date;
  
  /** Optional OIDC ID token containing user claims */
  idToken?: string;
  
  /** Optional OAuth2 scopes granted to this session */
  scopes?: string[];
  
  /** Optional unique identifier for this session instance */
  sessionId?: string;
}

/**
 * Application-wide authentication state container.
 * 
 * This interface represents the current authentication state of the application and is
 * typically managed by a state management solution (e.g., TanStack Query, Zustand, Redux).
 * It provides a centralized source of truth for authentication status across all components.
 * 
 * @interface AuthState
 * 
 * @property {User | null} user - The currently authenticated user, or null if not authenticated
 * @property {Session | null} session - The current session data, or null if no active session
 * @property {boolean} isAuthenticated - Flag indicating whether a user is currently authenticated
 * @property {boolean} isLoading - Flag indicating whether authentication state is being loaded
 * @property {AuthError | null} error - Current authentication error, or null if no error
 * @property {Date | null} lastRefreshed - Timestamp of the last token refresh, or null if never refreshed
 * 
 * @example
 * const authState: AuthState = {
 *   user: currentUser,
 *   session: currentSession,
 *   isAuthenticated: true,
 *   isLoading: false,
 *   error: null,
 *   lastRefreshed: new Date()
 * };
 */
export interface AuthState {
  /** The currently authenticated user, or null if not authenticated */
  user: User | null;
  
  /** The current session data, or null if no active session */
  session: Session | null;
  
  /** Flag indicating whether a user is currently authenticated */
  isAuthenticated: boolean;
  
  /** Flag indicating whether authentication state is being loaded or refreshed */
  isLoading: boolean;
  
  /** Current authentication error, or null if no error exists */
  error: AuthError | null;
  
  /** Timestamp of the last token refresh, or null if never refreshed */
  lastRefreshed: Date | null;
}

/**
 * OAuth2 redirect flow credentials for initiating authentication.
 * 
 * This interface defines the structure for OAuth2 authorization code flow parameters.
 * It is used when redirecting users to the identity provider for authentication.
 * The redirect URI must be registered with the OAuth2 provider.
 * 
 * @interface LoginCredentials
 * 
 * @property {string} redirectUri - Registered OAuth2 redirect URI where the user will be sent after authentication
 * @property {string[]} [scopes] - Optional OAuth2 scopes to request (defaults to 'openid profile email')
 * @property {string} [state] - Optional state parameter for CSRF protection (recommended)
 * @property {string} [nonce] - Optional nonce for OIDC ID token validation
 * @property {string} [codeChallenge] - Optional PKCE code challenge for enhanced security
 * @property {string} [codeChallengeMethod] - Optional PKCE code challenge method ('S256' or 'plain')
 * @property {Record<string, string>} [additionalParams] - Optional additional OAuth2 parameters
 * 
 * @example
 * const credentials: LoginCredentials = {
 *   redirectUri: 'https://hub.ucsc.edu/auth/callback',
 *   scopes: ['openid', 'profile', 'email', 'roles'],
 *   state: 'random_state_string_for_csrf',
 *   nonce: 'random_nonce_string',
 *   codeChallenge: 'base64url_encoded_challenge',
 *   codeChallengeMethod: 'S256',
 *   additionalParams: { prompt: 'consent' }
 * };
 */
export interface LoginCredentials {
  /** Registered OAuth2 redirect URI where the user will be sent after authentication */
  redirectUri: string;
  
  /** Optional OAuth2 scopes to request (defaults to 'openid profile email' if not specified) */
  scopes?: string[];
  
  /** Optional state parameter for CSRF protection (highly recommended for security) */
  state?: string;
  
  /** Optional nonce for OIDC ID token validation (prevents replay attacks) */
  nonce?: string;
  
  /** Optional PKCE code challenge for enhanced security (recommended for SPAs) */
  codeChallenge?: string;
  
  /** Optional PKCE code challenge method ('S256' is recommended, 'plain' is less secure) */
  codeChallengeMethod?: 'S256' | 'plain';
  
  /** Optional additional OAuth2 parameters (e.g., prompt, max_age, ui_locales) */
  additionalParams?: Record<string, string>;
}

/**
 * Standardized error codes for authentication operations.
 * 
 * @typedef {string} AuthErrorCode
 */
export type AuthErrorCode =
  /** Invalid or expired authentication token */
  | 'INVALID_TOKEN'
  /** Token has expired and needs to be refreshed */
  | 'TOKEN_EXPIRED'
  /** Refresh token is invalid or expired */
  | 'REFRESH_TOKEN_INVALID'
  /** User credentials are invalid */
  | 'INVALID_CREDENTIALS'
  /** User account is not authorized to access this resource */
  | 'UNAUTHORIZED'
  /** User account is locked or suspended */
  | 'ACCOUNT_LOCKED'
  /** User session has expired */
  | 'SESSION_EXPIRED'
  /** OAuth2 authorization request failed */
  | 'OAUTH_ERROR'
  /** OIDC authentication failed */
  | 'OIDC_ERROR'
  /** Network error during authentication */
  | 'NETWORK_ERROR'
  /** Authentication server is unavailable */
  | 'SERVER_ERROR'
  /** User cancelled the authentication flow */
  | 'USER_CANCELLED'
  /** Required user role is missing */
  | 'INSUFFICIENT_PERMISSIONS'
  /** Unknown or unspecified error */
  | 'UNKNOWN_ERROR';

/**
 * Detailed authentication error information.
 * 
 * This type provides comprehensive error information for authentication failures,
 * including error codes, human-readable messages, and additional context for debugging.
 * It follows the OAuth2 error response format and includes extensions for better UX.
 * 
 * @interface AuthError
 * 
 * @property {AuthErrorCode} code - Machine-readable error code for programmatic handling
 * @property {string} message - Human-readable error message suitable for display to users
 * @property {string} [description] - Optional detailed description for debugging purposes
 * @property {Record<string, unknown>} [details] - Optional additional error context and metadata
 * @property {Date} [timestamp] - Optional timestamp when the error occurred
 * @property {string} [requestId] - Optional request ID for error tracking and support
 * 
 * @example
 * const error: AuthError = {
 *   code: 'TOKEN_EXPIRED',
 *   message: 'Your session has expired. Please log in again.',
 *   description: 'JWT token expired at 2024-12-20T12:00:00Z',
 *   details: {
 *     tokenType: 'access_token',
 *     expiredAt: '2024-12-20T12:00:00Z',
 *     currentTime: '2024-12-20T12:05:00Z'
 *   },
 *   timestamp: new Date(),
 *   requestId: 'req_abc123xyz'
 * };
 */
export interface AuthError {
  /** Machine-readable error code for programmatic handling and error recovery */
  code: AuthErrorCode;
  
  /** Human-readable error message suitable for display to end users */
  message: string;
  
  /** Optional detailed description for debugging purposes (not typically shown to users) */
  description?: string;
  
  /** Optional additional error context and metadata for debugging and logging */
  details?: Record<string, unknown>;
  
  /** Optional timestamp when the error occurred (UTC) */
  timestamp?: Date;
  
  /** Optional request ID for error tracking, logging, and customer support */
  requestId?: string;
}

/**
 * Type guard to check if a value is a valid Role.
 * 
 * @param value - The value to check
 * @returns True if the value is a valid Role
 * 
 * @example
 * if (isRole(userInput)) {
 *   // TypeScript knows userInput is a Role here
 *   const role: Role = userInput;
 * }
 */
export function isRole(value: unknown): value is Role {
  return (
    typeof value === 'string' &&
    ['student', 'instructor', 'admin', 'staff'].includes(value)
  );
}

/**
 * Type guard to check if an error is an AuthError.
 * 
 * @param error - The error to check
 * @returns True if the error is an AuthError
 * 
 * @example
 * try {
 *   await authenticate();
 * } catch (error) {
 *   if (isAuthError(error)) {
 *     console.error(`Auth error: ${error.code} - ${error.message}`);
 *   }
 * }
 */
export function isAuthError(error: unknown): error is AuthError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as AuthError).code === 'string' &&
    typeof (error as AuthError).message === 'string'
  );
}

/**
 * Helper type for partial user updates.
 * 
 * @example
 * const updates: UserUpdate = {
 *   name: 'Jane Doe',
 *   avatarUrl: 'https://example.com/new-avatar.jpg'
 * };
 */
export type UserUpdate = Partial<Omit<User, 'id' | 'createdAt'>>;

/**
 * Helper type for session refresh response.
 * 
 * @example
 * const refreshed: SessionRefresh = {
 *   token: 'new_access_token',
 *   refreshToken: 'new_refresh_token',
 *   expiresAt: new Date(Date.now() + 3600000)
 * };
 */
export type SessionRefresh = Pick<Session, 'token' | 'refreshToken' | 'expiresAt'>;
