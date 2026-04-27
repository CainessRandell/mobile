import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { api } from '@/api/api';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import type { AuthUser } from '@/contexts/AuthContext';

type LoginResponse = {
  token?: string;
  accessToken?: string;
  jwt?: string;
  _id?: string;
  nome?: string;
  email?: string;
  role?: string;
  user?: Partial<AuthUser>;
  usuario?: Partial<AuthUser>;
  data?: {
    token?: string;
    accessToken?: string;
    jwt?: string;
    _id?: string;
    nome?: string;
    email?: string;
    role?: string;
    user?: Partial<AuthUser>;
    usuario?: Partial<AuthUser>;
  };
};

function extractToken(data: LoginResponse) {
  return (
    data.token ??
    data.accessToken ??
    data.jwt ??
    data.data?.token ??
    data.data?.accessToken ??
    data.data?.jwt
  );
}

function extractUser(data: LoginResponse): AuthUser {
  const userData =
    data.user ?? data.usuario ?? data.data?.user ?? data.data?.usuario ?? data.data ?? data;

  return {
    _id: userData._id ?? '',
    nome: userData.nome ?? '',
    email: userData.email ?? '',
    role: userData.role ?? '',
  };
}

export function LoginScreen() {
  const { isAuthenticated, saveSession, signOut, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Login', 'Informe o email e a senha.');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await api.post<LoginResponse>('/auth/login', {
        email: email.trim(),
        senha: password,
      });

      const token = extractToken(response.data);

      if (!token) {
        Alert.alert('Login', 'A API nao retornou um token.');
        return;
      }

      await saveSession(token, extractUser(response.data));
      setPassword('');
      Alert.alert('Login', 'Login realizado com sucesso.');
    } catch {
      Alert.alert('Login', 'Nao foi possivel realizar o login.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    setEmail('');
    setPassword('');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Login" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}
      >
        <View style={styles.form}>
          {isAuthenticated ? (
            <View style={styles.userCard}>
              <Text style={styles.userTitle}>Usuario autenticado</Text>

              <View style={styles.userRow}>
                <Text style={styles.userLabel}>_id</Text>
                <Text style={styles.userValue}>{user?._id || '-'}</Text>
              </View>

              <View style={styles.userRow}>
                <Text style={styles.userLabel}>nome</Text>
                <Text style={styles.userValue}>{user?.nome || '-'}</Text>
              </View>

              <View style={styles.userRow}>
                <Text style={styles.userLabel}>email</Text>
                <Text style={styles.userValue}>{user?.email || '-'}</Text>
              </View>

              <View style={styles.userRow}>
                <Text style={styles.userLabel}>role</Text>
                <Text style={styles.userValue}>{user?.role || '-'}</Text>
              </View>

              <Pressable style={styles.logoutButton} onPress={handleSignOut}>
                <Text style={styles.logoutButtonText}>Logout</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={styles.label}>Email</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                placeholder="email@exemplo.com"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
              />

              <Text style={styles.label}>Senha</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="password"
                placeholder="Informe sua senha"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                style={styles.input}
                value={password}
                onChangeText={setPassword}
              />

              <Pressable
                disabled={isSubmitting}
                style={[styles.button, isSubmitting && styles.disabledButton]}
                onPress={handleLogin}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Entrar</Text>
                )}
              </Pressable>
            </>
          )}
        </View>
      </KeyboardAvoidingView>

      <Footer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F9FAFB',
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  form: {
    gap: 10,
  },
  label: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    borderRadius: 8,
    borderWidth: 1,
    color: '#111827',
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#0F766E',
    borderRadius: 8,
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 48,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  userTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  userRow: {
    gap: 4,
  },
  userLabel: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
  },
  userValue: {
    color: '#111827',
    fontSize: 15,
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: '#B91C1C',
    borderRadius: 8,
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 48,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
