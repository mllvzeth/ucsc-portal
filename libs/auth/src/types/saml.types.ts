/**
 * SAML 2.0 Authentication Types for UCSC Assessment Hub
 * 
 * This module provides TypeScript types for SAML 2.0 authentication
 * using SimpleSAMLphp infrastructure (matching UC production environment).
 * 
 * @module saml.types
 */

import type { Role } from './auth.types';

/**
 * SAML Service Provider configuration.
 * 
 * @interface SAMLConfig
 */
export interface SAMLConfig {
  /** SAML IdP entry point URL (SSO Service endpoint) */
  entryPoint: string;
  
  /** Service Provider entity ID (issuer) */
  issuer: string;
  
  /** Assertion Consumer Service URL (callback endpoint) */
  callbackUrl: string;
  
  /** IdP's X.509 certificate for signature validation */
  cert: string;
  
  /** Optional: Private key for signing requests */
  privateKey?: string;
  
  /** Optional: SP certificate for encryption */
  decryptionPvk?: string;
  
  /** Whether to sign authentication requests */
  signatureAlgorithm?: 'sha1' | 'sha256' | 'sha512';
  
  /** Identifier format for NameID */
  identifierFormat?: string;
  
  /** Whether to accept unsigned responses (not recommended for production) */
  wantAssertionsSigned?: boolean;
  
  /** Whether to validate IdP certificate in response */
  wantAuthnResponseSigned?: boolean;
}

/**
 * SAML authentication request options.
 * 
 * @interface SAMLAuthRequest
 */
export interface SAMLAuthRequest {
  /** Optional RelayState to preserve across SSO flow */
  relayState?: string;
  
  /** Force re-authentication even if session exists */
  forceAuthn?: boolean;
  
  /** Request passive authentication (no user interaction) */
  isPassive?: boolean;
  
  /** Requested authentication context class */
  authnContext?: string[];
}

/**
 * Raw SAML profile data from IdP assertion.
 * 
 * @interface SAMLProfile
 */
export interface SAMLProfile {
  /** NameID value (unique identifier from IdP) */
  nameID: string;
  
  /** NameID format */
  nameIDFormat?: string;
  
  /** Session index from IdP */
  sessionIndex?: string;
  
  /** User's email address */
  email?: string;
  
  /** User's display name */
  displayName?: string;
  
  /** User's first name */
  firstName?: string;
  
  /** User's last name */
  lastName?: string;
  
  /** User's unique identifier (e.g., employee ID, student ID) */
  uid?: string;
  
  /** User's affiliation/role from IdP */
  eduPersonAffiliation?: string | string[];
  
  /** Additional attributes from SAML assertion */
  attributes?: Record<string, string | string[]>;
}

/**
 * Parsed and normalized user data from SAML assertion.
 * 
 * @interface SAMLUser
 */
export interface SAMLUser {
  /** Unique identifier (from nameID or uid attribute) */
  id: string;
  
  /** User's email address */
  email: string;
  
  /** User's full display name */
  name: string;
  
  /** Mapped roles based on eduPersonAffiliation */
  roles: Role[];
  
  /** Raw SAML profile for debugging/extended attributes */
  samlProfile: SAMLProfile;
  
  /** Session index for SLO (Single Logout) */
  sessionIndex?: string;
}

/**
 * SAML authentication result.
 * 
 * @interface SAMLAuthResult
 */
export interface SAMLAuthResult {
  /** Whether authentication was successful */
  success: boolean;
  
  /** Authenticated user (if successful) */
  user?: SAMLUser;
  
  /** Error message (if failed) */
  error?: string;
  
  /** Error code for programmatic handling */
  errorCode?: SAMLErrorCode;
  
  /** Redirect URL (for login initiation) */
  redirectUrl?: string;
}

/**
 * SAML-specific error codes.
 */
export type SAMLErrorCode =
  | 'SAML_CONFIG_ERROR'
  | 'SAML_RESPONSE_INVALID'
  | 'SAML_SIGNATURE_INVALID'
  | 'SAML_ASSERTION_EXPIRED'
  | 'SAML_AUDIENCE_MISMATCH'
  | 'SAML_MISSING_ATTRIBUTES'
  | 'SAML_IDP_ERROR'
  | 'SAML_NETWORK_ERROR';

/**
 * Maps eduPersonAffiliation values to application roles.
 * 
 * @param affiliations - eduPersonAffiliation value(s) from SAML assertion
 * @returns Array of mapped Role values
 */
export function mapAffiliationToRoles(
  affiliations: string | string[] | undefined
): Role[] {
  if (!affiliations) {
    return ['student']; // Default role
  }
  
  const affiliationList = Array.isArray(affiliations) ? affiliations : [affiliations];
  const roles: Role[] = [];
  
  for (const affiliation of affiliationList) {
    const normalized = affiliation.toLowerCase();
    
    if (normalized.includes('faculty') || normalized.includes('instructor')) {
      roles.push('instructor');
    } else if (normalized.includes('staff')) {
      roles.push('staff');
    } else if (normalized.includes('admin') || normalized.includes('administrator')) {
      roles.push('admin');
    } else if (normalized.includes('student')) {
      roles.push('student');
    }
  }
  
  // Ensure at least one role
  if (roles.length === 0) {
    roles.push('student');
  }
  
  // Remove duplicates
  return [...new Set(roles)];
}

/**
 * Type guard to check if a value is a valid SAMLProfile.
 */
export function isSAMLProfile(value: unknown): value is SAMLProfile {
  return (
    typeof value === 'object' &&
    value !== null &&
    'nameID' in value &&
    typeof (value as SAMLProfile).nameID === 'string'
  );
}
