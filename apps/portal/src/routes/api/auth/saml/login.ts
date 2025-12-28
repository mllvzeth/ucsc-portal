import { createFileRoute } from '@tanstack/react-router'
/**
 * SAML Login API Route (Server-Only)
 *
 * Initiates SAML authentication by redirecting to the IdP.
 * This runs entirely on the server to avoid bundling Node.js-only
 * dependencies in the client.
 */

import { createAPIFileRoute } from '@tanstack/react-start/api';

export const Route = createAPIFileRoute('/api/auth/saml/login')({
  GET: async ({ request }) => {
    try {
      // Dynamic import to keep Node.js-only code out of client bundle
      const { generateAuthUrl } = await import('@/auth/services/saml.service');

      // Get optional relay state from query params
      const url = new URL(request.url);
      const relayState = url.searchParams.get('redirect') || '/';

      // Generate SAML auth URL
      const redirectUrl = await generateAuthUrl(relayState);

      // Redirect to IdP
      return new Response(null, {
        status: 302,
        headers: {
          Location: redirectUrl,
        },
      });
    } catch (error) {
      console.error('Failed to initiate SAML login:', error);
      return new Response(null, {
        status: 302,
        headers: {
          Location: '/login?error=saml_init_failed',
        },
      });
    }
  },
});
