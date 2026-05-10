import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
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
import { getApiErrorMessage } from '@/api/apiError';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { PostForm } from '@/components/PostForm';
import type { PostFormValues } from '@/components/PostForm';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import type { AppRoutesParamList } from '@/navigation/app.routes';

type Navigation = NativeStackNavigationProp<AppRoutesParamList>;

export function CriarPostScreen() {
  const navigation = useNavigation<Navigation>();
  const { token, user } = useAuth();
  const { canCreatePost } = usePermissions();
  const [formValues, setFormValues] = useState<PostFormValues>({
    titulo: '',
    conteudo: '',
    autor: user?.nome ?? '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormValues((current) => ({
      ...current,
      autor: current.autor || user?.nome || '',
    }));
  }, [user?.nome]);

  async function handleCreatePost() {
    if (!canCreatePost || !token) {
      Alert.alert('Criar post', 'Acesso permitido somente para professor autenticado.');
      return;
    }

    if (!formValues.titulo.trim() || !formValues.conteudo.trim() || !formValues.autor.trim()) {
      Alert.alert('Criar post', 'Informe titulo, conteudo e autor.');
      return;
    }

    try {
      setIsSubmitting(true);

      await api.post(
        '/posts',
        {
          titulo: formValues.titulo.trim(),
          conteudo: formValues.conteudo.trim(),
          autor: formValues.autor.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      Alert.alert('Criar post', 'Post criado com sucesso.');
      navigation.navigate('Administrativo');
    } catch (error) {
      Alert.alert('Criar post', getApiErrorMessage(error, 'Nao foi possivel criar o post.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Criar Post" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}
      >
        <ScrollView
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          {!canCreatePost ? (
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
            <PostForm
              isSubmitting={isSubmitting}
              submitLabel="Criar"
              values={formValues}
              onCancel={() => navigation.goBack()}
              onChange={setFormValues}
              onSubmit={handleCreatePost}
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
