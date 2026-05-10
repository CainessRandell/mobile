import { useState } from 'react';
import { signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
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
import { firebaseAuth, isFirebaseConfigured } from '@/services/firebase';

type BackendLoginResponse = {
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

function getStringValue(data: Record<string, unknown>, key: string) {
  const value = data[key];

  return typeof value === 'string' ? value : '';
}

function extractBackendToken(data: BackendLoginResponse) {
  return (
    data.token ??
    data.accessToken ??
    data.jwt ??
    data.data?.token ??
    data.data?.accessToken ??
    data.data?.jwt
  );
}

function extractBackendUser(data: BackendLoginResponse, firebaseUser: FirebaseUser): AuthUser {
  const userData =
    data.user ?? data.usuario ?? data.data?.user ?? data.data?.usuario ?? data.data ?? data;

  const userRecord = userData as Record<string, unknown>;
  const nome =
    getStringValue(userRecord, 'nome') ||
    getStringValue(userRecord, 'name') ||
    firebaseUser.displayName ||
    firebaseUser.email?.split('@')[0] ||
    '';

  return {
    _id: getStringValue(userRecord, '_id') || getStringValue(userRecord, 'id') || firebaseUser.uid,
    nome,
    email: getStringValue(userRecord, 'email') || firebaseUser.email || '',
    role: getStringValue(userRecord, 'role'),
  };
}

function getFirebaseLoginMessage(error: unknown) {
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String(error.code)
      : '';

  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
    return 'Email ou senha invalidos.';
  }

  if (code === 'auth/user-not-found') {
    return 'Usuario nao encontrado.';
  }

  if (code === 'auth/too-many-requests') {
    return 'Muitas tentativas de login. Tente novamente mais tarde.';
  }

  if (code === 'auth/network-request-failed') {
    return 'Falha de rede ao autenticar no Firebase.';
  }

  return 'Nao foi possivel realizar o login.';
}

export function LoginScreen() {
  const { isAuthenticated, saveSession, signOut, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    if (!isFirebaseConfigured || !firebaseAuth) {
      Alert.alert('Login', 'Firebase Authentication nao esta configurado.');
      return;
    }

    if (!email.trim() || !password.trim()) {
      Alert.alert('Login', 'Informe o email e a senha.');
      return;
    }

    try {
      setIsSubmitting(true);

      const credentials = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
      const response = await api.post<BackendLoginResponse>('/auth/login', {
        firebaseUid: credentials.user.uid,
      });

      const bearerToken = extractBackendToken(response.data);

      if (!bearerToken) {
        await firebaseSignOut(firebaseAuth);
        Alert.alert('Login', 'A API nao retornou o bearerAuth.');
        return;
      }

      await saveSession(bearerToken, extractBackendUser(response.data, credentials.user));
      setPassword('');
      Alert.alert('Login', 'Login realizado com sucesso.');
    } catch (error) {
      if (firebaseAuth.currentUser) {
        try {
          await firebaseSignOut(firebaseAuth);
        } catch {
          // A sessao local do app nao sera salva quando a API falhar.
        }
      }

      Alert.alert('Login', getFirebaseLoginMessage(error));
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
              <View style={styles.passwordRow}>
                <TextInput
                  autoCapitalize="none"
                  autoComplete="current-password"
                  placeholder="Informe sua senha"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  style={styles.passwordInput}
                  textContentType="password"
                  value={password}
                  onChangeText={setPassword}
                />

                <Pressable
                  accessibilityRole="button"
                  disabled={isSubmitting}
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword((current) => !current)}
                >
                  <Text style={styles.passwordToggleText}>
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </Text>
                </Pressable>
              </View>

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
  passwordRow: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 48,
  },
  passwordInput: {
    color: '#111827',
    flex: 1,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  passwordToggle: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 12,
  },
  passwordToggleText: {
    color: '#0F766E',
    fontSize: 13,
    fontWeight: '800',
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
