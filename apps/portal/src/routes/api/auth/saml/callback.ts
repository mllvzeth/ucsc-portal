import { createFileRoute } from '@tanstack/react-router'
/**
 * SAML Callback API Route (Server-Only)
 *
 * Handles the HTTP-POST binding from the SAML IdP.
 * The IdP POSTs SAMLResponse to this endpoint after authentication.
 */

import { createAPIFileRoute } from '@tanstack/react-start/api';

export const Route = createAPIFileRoute('/api/auth/saml/callback')({
  POST: async ({ request }) => {
    try {
      // Dynamic import to keep Node.js-only code out of client bundle
      const { validateSAMLResponse } = await import('@/auth/services/saml.service');

      // Parse form data from IdP POST
      const formData = await request.formData();
      const samlResponse = formData.get('SAMLResponse') as string;
      const relayState = formData.get('RelayState') as string | null;

      if (!samlResponse) {
        // Redirect to login with error
        return new Response(null, {
          status: 302,
          headers: {
            Location: '/login?error=missing_saml_response',
          },
        });
      }

      // Validate the SAML response
      const result = await validateSAMLResponse(samlResponse);

      if (result.success && result.user) {
        // Encode user data for client-side handling
        const userData = encodeURIComponent(
          JSON.stringify({
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            roles: result.user.roles,
            sessionIndex: result.user.sessionIndex,
          })
        );

        // Redirect to client callback page with user data
        const redirectTo = relayState || '/';
        return new Response(null, {
          status: 302,
          headers: {
            Location: `/auth/saml/callback?success=true&user=${userData}&redirect=${encodeURIComponent(redirectTo)}`,
          },
        });
      } else {
        // Authentication failed
        console.error('SAML validation failed:', result.error);
        return new Response(null, {
          status: 302,
          headers: {
            Location: `/login?error=${encodeURIComponent(result.error || 'auth_failed')}`,
          },
        });
      }
    } catch (error) {
      console.error('SAML callback error:', error);
      return new Response(null, {
        status: 302,
        headers: {
          Location: '/login?error=server_error',
        },
      });
    }
  },
});
