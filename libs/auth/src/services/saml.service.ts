/**
 * SAML 2.0 Service for UCSC Assessment Hub
 * 
 * Provides SAML authentication functionality using @node-saml/passport-saml.
 * This service handles SAML request generation and response validation.
 * 
 * @module saml.service
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env from repository root for server-side code
config({ path: resolve(process.cwd(), '.env') });

import { SAML, ValidateInResponseTo } from '@node-saml/passport-saml';
import type {
  SAMLConfig,
  SAMLProfile,
  SAMLUser,
  SAMLAuthResult,
} from '../types/saml.types';
import { mapAffiliationToRoles } from '../types/saml.types';

/**
 * Default SAML configuration for local development with test IdP.
 */
const DEFAULT_CONFIG: SAMLConfig = {
  entryPoint: 'http://localhost:8080/simplesaml/saml2/idp/SSOService.php',
  issuer: 'http://localhost:3000',
  callbackUrl: 'http://localhost:3000/api/auth/saml/callback',
  cert: '', // Will be loaded from environment
  wantAssertionsSigned: false, // Relaxed for test IdP
  wantAuthnResponseSigned: false, // Relaxed for test IdP
};

/**
 * Creates SAML configuration from environment variables.
 */
export function getSAMLConfig(): SAMLConfig {
  return {
    entryPoint: process.env.SAML_ENTRY_POINT || DEFAULT_CONFIG.entryPoint,
    issuer: process.env.SAML_ISSUER || DEFAULT_CONFIG.issuer,
    callbackUrl: process.env.SAML_CALLBACK_URL || DEFAULT_CONFIG.callbackUrl,
    cert: process.env.SAML_IDP_CERT || DEFAULT_CONFIG.cert,
    wantAssertionsSigned: process.env.NODE_ENV === 'production',
    wantAuthnResponseSigned: process.env.NODE_ENV === 'production',
  };
}

/**
 * Creates a SAML strategy instance.
 */
export function createSAMLStrategy(config?: Partial<SAMLConfig>): SAML {
  const samlConfig = { ...getSAMLConfig(), ...config };
  
  // Normalize certificate - ensure it's properly formatted
  // Strip any PEM headers/whitespace (passport-saml v5+ expects raw base64)
  let cert = (samlConfig.cert || '')
    .replace(/-----BEGIN CERTIFICATE-----/g, '')
    .replace(/-----END CERTIFICATE-----/g, '')
    .replace(/[\r\n\s]/g, '');
  
  return new SAML({
    entryPoint: samlConfig.entryPoint,
    issuer: samlConfig.issuer,
    callbackUrl: samlConfig.callbackUrl,
    idpCert: cert,
    wantAssertionsSigned: samlConfig.wantAssertionsSigned,
    wantAuthnResponseSigned: samlConfig.wantAuthnResponseSigned,
    // Additional security settings
    validateInResponseTo: ValidateInResponseTo.never,
    disableRequestedAuthnContext: true,
  });
}

/**
 * Generates a SAML authentication request URL.
 * 
 * @param relayState - Optional state to preserve across SSO flow
 * @returns Promise resolving to the redirect URL
 */
export async function generateAuthUrl(relayState?: string): Promise<string> {
  const saml = createSAMLStrategy();
  
  try {
    const url = await saml.getAuthorizeUrlAsync(relayState || '/', undefined, {});
    return url;
  } catch (err) {
    throw new Error(`Failed to generate SAML auth URL: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

/**
 * Validates a SAML response and extracts user profile.
 * 
 * @param samlResponse - Base64-encoded SAML response from IdP
 * @returns Promise resolving to SAMLAuthResult
 */
export async function validateSAMLResponse(
  samlResponse: string
): Promise<SAMLAuthResult> {
  const saml = createSAMLStrategy();
  
  try {
    const result = await saml.validatePostResponseAsync({
      SAMLResponse: samlResponse,
    });
    
    if (!result || !result.profile) {
      return {
        success: false,
        error: 'Invalid SAML response: missing profile',
        errorCode: 'SAML_RESPONSE_INVALID',
      };
    }
    
    const profile = parseSAMLProfile(result.profile);
    const user = createSAMLUser(profile);
    
    return {
      success: true,
      user,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown SAML error';
    console.error('SAML validation error:', errorMessage);
    
    return {
      success: false,
      error: errorMessage,
      errorCode: 'SAML_RESPONSE_INVALID',
    };
  }
}

/**
 * Parses raw SAML profile into our SAMLProfile type.
 */
function parseSAMLProfile(rawProfile: Record<string, unknown>): SAMLProfile {
  // The test IdP uses different attribute names than production
  // Map common variations
  const email = 
    (rawProfile.email as string) ||
    (rawProfile['urn:oid:0.9.2342.19200300.100.1.3'] as string) ||
    (rawProfile.mail as string) ||
    '';
  
  const displayName =
    (rawProfile.displayName as string) ||
    (rawProfile['urn:oid:2.16.840.1.113730.3.1.241'] as string) ||
    (rawProfile.cn as string) ||
    '';
  
  const firstName =
    (rawProfile.firstName as string) ||
    (rawProfile.givenName as string) ||
    (rawProfile['urn:oid:2.5.4.42'] as string) ||
    '';
  
  const lastName =
    (rawProfile.lastName as string) ||
    (rawProfile.sn as string) ||
    (rawProfile['urn:oid:2.5.4.4'] as string) ||
    '';
  
  const uid =
    (rawProfile.uid as string) ||
    (rawProfile['urn:oid:0.9.2342.19200300.100.1.1'] as string) ||
    '';
  
  const eduPersonAffiliation =
    (rawProfile.eduPersonAffiliation as string | string[]) ||
    (rawProfile['urn:oid:1.3.6.1.4.1.5923.1.1.1.1'] as string | string[]);
  
  return {
    nameID: rawProfile.nameID as string,
    nameIDFormat: rawProfile.nameIDFormat as string | undefined,
    sessionIndex: rawProfile.sessionIndex as string | undefined,
    email,
    displayName,
    firstName,
    lastName,
    uid,
    eduPersonAffiliation,
    attributes: rawProfile as Record<string, string | string[]>,
  };
}

/**
 * Creates a SAMLUser from a parsed profile.
 */
function createSAMLUser(profile: SAMLProfile): SAMLUser {
  // Build display name from available fields
  const name = 
    profile.displayName ||
    [profile.firstName, profile.lastName].filter(Boolean).join(' ') ||
    profile.email?.split('@')[0] ||
    profile.nameID;
  
  return {
    id: profile.uid || profile.nameID,
    email: profile.email || `${profile.nameID}@ucsc.edu`,
    name,
    roles: mapAffiliationToRoles(profile.eduPersonAffiliation),
    samlProfile: profile,
    sessionIndex: profile.sessionIndex,
  };
}

/**
 * Generates SAML metadata for SP registration.
 * 
 * @returns SP metadata XML
 */
export function generateMetadata(): string {
  const saml = createSAMLStrategy();
  
  return saml.generateServiceProviderMetadata(
    null, // decryptionCert
    null  // signingCert
  );
}
