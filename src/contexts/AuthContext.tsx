import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { Platform } from 'react-native';

import { clearApiAuthToken, setApiAuthToken } from '@/api/api';

const AUTH_TOKEN_KEY = 'fivam.auth.token';
const AUTH_USER_KEY = 'fivam.auth.user';

export type AuthUser = {
  _id: string;
  nome: string;
  email: string;
  role: string;
};

async function getStoredValue(key: string) {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem(key) ?? null;
  }

  return SecureStore.getItemAsync(key);
}

async function setStoredValue(key: string, value: string) {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

async function deleteStoredValue(key: string) {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

type AuthContextData = {
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  token: string | null;
  user: AuthUser | null;
  saveSession: (token: string, user: AuthUser) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextData>({
  isAuthenticated: false,
  isLoadingAuth: true,
  token: null,
  user: null,
  saveSession: async () => undefined,
  signOut: async () => undefined,
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    async function loadStoredToken() {
      try {
        const storedToken = await getStoredValue(AUTH_TOKEN_KEY);
        const storedUser = await getStoredValue(AUTH_USER_KEY);

        if (storedToken) {
          setToken(storedToken);
          setApiAuthToken(storedToken);
        }

        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser) as AuthUser);
          } catch {
            await deleteStoredValue(AUTH_USER_KEY);
          }
        }
      } finally {
        setIsLoadingAuth(false);
      }
    }

    loadStoredToken();
  }, []);

  const saveSession = useCallback(async (newToken: string, newUser: AuthUser) => {
    await setStoredValue(AUTH_TOKEN_KEY, newToken);
    await setStoredValue(AUTH_USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setApiAuthToken(newToken);
  }, []);

  const signOut = useCallback(async () => {
    await deleteStoredValue(AUTH_TOKEN_KEY);
    await deleteStoredValue(AUTH_USER_KEY);
    setToken(null);
    setUser(null);
    clearApiAuthToken();
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(token),
      isLoadingAuth,
      token,
      user,
      saveSession,
      signOut,
    }),
    [isLoadingAuth, saveSession, signOut, token, user],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
