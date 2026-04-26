import { createContext, useContext } from 'react';
import type { PropsWithChildren } from 'react';

type AuthContextData = {
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextData>({
  isAuthenticated: false,
});

export function AuthProvider({ children }: PropsWithChildren) {
  return (
    <AuthContext.Provider value={{ isAuthenticated: false }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
