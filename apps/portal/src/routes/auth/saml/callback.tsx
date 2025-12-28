import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { useAuthContext } from '@/auth';
import type { Session } from '@/auth';

export const Route = createFileRoute('/auth/saml/callback')({
  component: SAMLCallbackPage,
  validateSearch: (search: Record<string, unknown>) => ({
    success: search.success as string | undefined,
    user: search.user as string | undefined,
    redirect: search.redirect as string | undefined,
    error: search.error as string | undefined,
  }),
});

function SAMLCallbackPage() {
  const navigate = useNavigate();
  const { updateSession } = useAuthContext();
  const search = Route.useSearch();
  const processedRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    // Handle redirect from API route after SAML validation
    const processCallback = async () => {
      try {
        if (search.error) {
          setError(decodeURIComponent(search.error));
          setTimeout(() => navigate({ to: '/login' }), 3000);
          return;
        }

        if (search.success === 'true' && search.user) {
          const userData = JSON.parse(decodeURIComponent(search.user));
          
          // Create session from validated user data
          const session: Session = {
            user: {
              id: userData.id,
              email: userData.email,
              name: userData.name,
              roles: userData.roles,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            token: `saml-session-${Date.now()}`,
            refreshToken: '',
            expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min session
            sessionId: userData.sessionIndex,
          };

          updateSession(session);
          
          const redirectTo = search.redirect ? decodeURIComponent(search.redirect) : '/';
          navigate({ to: redirectTo });
        } else {
          setError('Invalid callback - missing authentication data');
          setTimeout(() => navigate({ to: '/login' }), 3000);
        }
      } catch (err) {
        console.error('SAML callback processing error:', err);
        setError('An error occurred during authentication');
        setTimeout(() => navigate({ to: '/login' }), 3000);
      }
    };

    processCallback();
  }, [navigate, updateSession, search]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Completing sign in...</h2>
        <p className="text-gray-600">Please wait while we verify your credentials.</p>
      </div>
    </div>
  );
}
