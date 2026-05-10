import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
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
import type { UserFormValues } from '@/components/UserForm';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import type { AppRoutesParamList } from '@/navigation/app.routes';

type Navigation = NativeStackNavigationProp<AppRoutesParamList>;

export function CriarUsuarioScreen() {
  const navigation = useNavigation<Navigation>();
  const { token } = useAuth();
  const { canManageUsers } = usePermissions();
  const [formValues, setFormValues] = useState<UserFormValues>({
    nome: '',
    email: '',
    senha: '',
    confirmacaoSenha: '',
    role: 'aluno',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreateUser() {
    if (!canManageUsers || !token) {
      Alert.alert('Criar usuario', 'Acesso permitido somente para professor autenticado.');
      return;
    }

    if (
      !formValues.nome.trim() ||
      !formValues.email.trim() ||
      !formValues.senha.trim() ||
      !formValues.confirmacaoSenha.trim() ||
      !formValues.role.trim()
    ) {
      Alert.alert('Criar usuario', 'Informe nome, email, senha, confirmacao de senha e role.');
      return;
    }

    if (formValues.senha !== formValues.confirmacaoSenha) {
      Alert.alert('Criar usuario', 'A senha e a confirmacao de senha devem ser iguais.');
      return;
    }

    try {
      setIsSubmitting(true);

      await api.post(
        '/auth/register',
        {
          nome: formValues.nome.trim(),
          email: formValues.email.trim(),
          password: formValues.senha,
          role: formValues.role,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      Alert.alert('Criar usuario', 'Usuario criado com sucesso.');
      navigation.navigate(formValues.role === 'professor' ? 'Professores' : 'Alunos');
    } catch {
      Alert.alert('Criar usuario', 'Nao foi possivel criar o usuario.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Criar Usuario" />

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
          ) : (
            <UserForm
              isSubmitting={isSubmitting}
              submitLabel="Criar"
              values={formValues}
              onCancel={() => navigation.goBack()}
              onChange={setFormValues}
              onSubmit={handleCreateUser}
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
