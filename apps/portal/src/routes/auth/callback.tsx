import { createFileRoute } from '@tanstack/react-router';
import { useAuthContext } from '@/auth';
import { useEffect, useRef } from 'react';

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const { handleLoginCallback } = useAuthContext();
  const navigate = Route.useNavigate();
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    handleLoginCallback()
      .then(() => {
        navigate({ to: '/' });
      })
      .catch((err) => {
        console.error('Callback error:', err);
        navigate({ to: '/login' });
      });
  }, [handleLoginCallback, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Completing sign in...</h2>
        <p className="text-gray-600">Please wait while we log you in.</p>
      </div>
    </div>
  );
}
