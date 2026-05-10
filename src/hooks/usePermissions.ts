import { useAuth } from '@/contexts/AuthContext';

export function usePermissions() {
  const { isAuthenticated, token, user } = useAuth();
  const isProfessor = user?.role?.toLowerCase() === 'professor';
  const hasAuthenticatedToken = isAuthenticated && Boolean(token);

  return {
    isProfessor,
    canAccessAdmin: hasAuthenticatedToken && isProfessor,
    canCreatePost: hasAuthenticatedToken && isProfessor,
    canEditPost: hasAuthenticatedToken && isProfessor,
    canDeletePost: hasAuthenticatedToken && isProfessor,
    canManagePosts: hasAuthenticatedToken && isProfessor,
    canManageUsers: hasAuthenticatedToken && isProfessor,
  };
}
