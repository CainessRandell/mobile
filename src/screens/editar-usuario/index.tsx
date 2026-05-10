import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { api } from '@/api/api';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { UserForm } from '@/components/UserForm';
import type { UserFormValues, UserRole } from '@/components/UserForm';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import type { AppRoutesParamList } from '@/navigation/app.routes';

type Navigation = NativeStackNavigationProp<AppRoutesParamList>;
type EditarUsuarioRoute = RouteProp<AppRoutesParamList, 'EditarUsuario'>;

type UserResponse = {
  _id: string;
  nome: string;
  email: string;
  role: string;
  __v?: number;
};

function normalizeUser(data: unknown): UserResponse | null {
  const response = data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
  const user = (response?.data && typeof response.data === 'object'
    ? response.data
    : response) as Record<string, unknown> | null;

  if (!user) {
    return null;
  }

  return {
    _id: String(user._id ?? ''),
    nome: String(user.nome ?? ''),
    email: String(user.email ?? ''),
    role: String(user.role ?? ''),
    __v: typeof user.__v === 'number' ? user.__v : undefined,
  };
}

function normalizeRole(role: string): UserRole {
  return role === 'professor' ? 'professor' : 'aluno';
}

export function EditarUsuarioScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<EditarUsuarioRoute>();
  const { token } = useAuth();
  const { canManageUsers } = usePermissions();
  const [formValues, setFormValues] = useState<UserFormValues>({
    nome: '',
    email: '',
    senha: '',
    confirmacaoSenha: '',
    role: 'aluno',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadUser = useCallback(async () => {
    if (!canManageUsers || !token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const response = await api.get(`/users/${route.params.userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const user = normalizeUser(response.data);

      if (!user) {
        setError('Usuario nao encontrado.');
        return;
      }

      setFormValues({
        nome: user.nome,
        email: user.email,
        senha: '',
        confirmacaoSenha: '',
        role: normalizeRole(user.role),
      });
    } catch {
      setError('Nao foi possivel carregar o usuario.');
    } finally {
      setIsLoading(false);
    }
  }, [canManageUsers, route.params.userId, token]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  async function handleUpdateUser() {
    if (!canManageUsers || !token) {
      Alert.alert('Editar usuario', 'Acesso permitido somente para professor autenticado.');
      return;
    }

    if (
      !formValues.nome.trim() ||
      !formValues.email.trim() ||
      !formValues.senha.trim() ||
      !formValues.confirmacaoSenha.trim() ||
      !formValues.role.trim()
    ) {
      Alert.alert('Editar usuario', 'Informe nome, email, senha, confirmacao de senha e role.');
      return;
    }

    if (formValues.senha !== formValues.confirmacaoSenha) {
      Alert.alert('Editar usuario', 'A senha e a confirmacao de senha devem ser iguais.');
      return;
    }

    try {
      setIsSubmitting(true);

      await api.put(
        `/users/${route.params.userId}`,
        {
          nome: formValues.nome.trim(),
          email: formValues.email.trim(),
          senha: formValues.senha,
          role: formValues.role,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      Alert.alert('Editar usuario', 'Usuario atualizado com sucesso.');
      navigation.navigate('Professores');
    } catch {
      Alert.alert('Editar usuario', 'Nao foi possivel atualizar o usuario.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Editar Usuario" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}
      >
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          {!canManageUsers ? (
            <View style={styles.feedback}>
              <Text style={styles.feedbackTitle}>Acesso restrito</Text>
              <Text style={styles.feedbackText}>
                Esta tela e exibida apenas para professor autenticado.
              </Text>
              <Pressable style={styles.restrictedButton} onPress={() => navigation.goBack()}>
                <Text style={styles.restrictedButtonText}>Voltar</Text>
              </Pressable>
            </View>
          ) : isLoading ? (
            <View style={styles.feedback}>
              <ActivityIndicator color="#0F766E" size="large" />
              <Text style={styles.feedbackText}>Carregando usuario...</Text>
            </View>
          ) : error ? (
            <View style={styles.feedback}>
              <Text style={styles.feedbackTitle}>{error}</Text>
              <Pressable style={styles.restrictedButton} onPress={() => navigation.goBack()}>
                <Text style={styles.restrictedButtonText}>Voltar</Text>
              </Pressable>
            </View>
          ) : (
            <UserForm
              isSubmitting={isSubmitting}
              values={formValues}
              onCancel={() => navigation.goBack()}
              onChange={setFormValues}
              onSubmit={handleUpdateUser}
            />
          )}
        </ScrollView>
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
  },
  form: {
    flexGrow: 1,
    gap: 10,
    padding: 16,
  },
  feedback: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  feedbackTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  feedbackText: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  restrictedButton: {
    alignItems: 'center',
    backgroundColor: '#0F766E',
    borderRadius: 8,
    justifyContent: 'center',
    marginTop: 18,
    minHeight: 46,
    paddingHorizontal: 24,
  },
  restrictedButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
