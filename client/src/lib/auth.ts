import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface User {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName: string;
  role: 'admin' | 'editor';
  createdAt: string;
  updatedAt: string;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  return {
    user: user?.user as User | null,
    isLoading,
    isAuthenticated: !!user?.user,
    isAdmin: user?.user?.role === 'admin',
    error,
  };
}

export async function login(username: string, password: string) {
  const response = await apiRequest('POST', '/api/auth/login', {
    username,
    password,
  });
  return response.json();
}

export async function logout() {
  await apiRequest('POST', '/api/auth/logout');
}
