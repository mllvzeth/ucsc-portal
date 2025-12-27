import { createFileRoute } from '@tanstack/react-router';
import { useAuthContext } from '@/auth';
import { Button } from '@/ui';
import { useEffect } from 'react';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  const { login, isAuthenticated } = useAuthContext();
  const navigate = Route.useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
          Sign in to Assessment Hub
        </h2>
        <div className="mt-8">
          <Button onClick={() => login()} size="lg" fullWidth>
            Sign in with UCSC ID
          </Button>
        </div>
      </div>
    </div>
  );
}
