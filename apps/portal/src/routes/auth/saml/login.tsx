import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/auth/saml/login')({
  // Redirect to the API route which handles SAML initiation server-side
  // This avoids bundling Node.js-only SAML dependencies in the client
  loader: async () => {
    throw redirect({
      href: '/api/auth/saml/login',
    });
  },
  component: SAMLLoginPage,
});

// This component is a fallback - the loader should redirect before this renders
function SAMLLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Redirecting to login...</h2>
        <p className="text-gray-600">Please wait while we redirect you to the login page.</p>
      </div>
    </div>
  );
}
