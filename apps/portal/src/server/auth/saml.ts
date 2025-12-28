/**
 * Server-side SAML Authentication Functions
 * 
 * These functions run on the server and handle SAML authentication flow.
 * They use TanStack Start's createServerFn for type-safe server functions.
 */

import { createServerFn } from '@tanstack/react-start';
import { 
  generateAuthUrl, 
  validateSAMLResponse,
  getSAMLConfig,
  generateMetadata,
} from '@/auth/services/saml.service';
import type { SAMLAuthResult } from '@/auth/types/saml.types';

/**
 * Server function to initiate SAML login.
 * Returns the IdP redirect URL for the client to navigate to.
 */
export const initiateSAMLLogin = createServerFn({
  method: 'GET',
}).handler(async (): Promise<{ redirectUrl: string }> => {
  try {
    const redirectUrl = await generateAuthUrl('/');
    return { redirectUrl };
  } catch (error) {
    console.error('Failed to initiate SAML login:', error);
    throw new Error('Failed to initiate SAML login');
  }
});

/**
 * Validates a SAML response (direct function, not server function for callback handling).
 */
export async function processSAMLCallback(
  samlResponse: string
): Promise<SAMLAuthResult> {
  try {
    if (!samlResponse) {
      return {
        success: false,
        error: 'Missing SAML response',
        errorCode: 'SAML_RESPONSE_INVALID',
      };
    }
    
    const result = await validateSAMLResponse(samlResponse);
    
    if (result.success && result.user) {
      // Log successful authentication (remove in production or use proper logging)
      console.log('SAML authentication successful:', {
        userId: result.user.id,
        email: result.user.email,
        roles: result.user.roles,
      });
    }
    
    return result;
  } catch (error) {
    console.error('SAML callback error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during SAML validation',
      errorCode: 'SAML_RESPONSE_INVALID',
    };
  }
}

/**
 * Server function to get SAML configuration (for debugging/setup).
 * Returns non-sensitive config information.
 */
export const getSAMLConfigInfo = createServerFn({
  method: 'GET',
}).handler(async () => {
  const config = getSAMLConfig();
  
  // Return only non-sensitive information
  return {
    entryPoint: config.entryPoint,
    issuer: config.issuer,
    callbackUrl: config.callbackUrl,
    hasCert: Boolean(config.cert),
  };
});

/**
 * Server function to get SP metadata.
 * Can be used for IdP registration.
 */
export const getSPMetadata = createServerFn({
  method: 'GET',
}).handler(async () => {
  try {
    const metadata = generateMetadata();
    return { metadata };
  } catch (error) {
    console.error('Failed to generate SP metadata:', error);
    throw new Error('Failed to generate SP metadata');
  }
});
