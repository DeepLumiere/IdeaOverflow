import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

export const useProtectedRoute = () => {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  return { isAuthenticated, loading };
};
