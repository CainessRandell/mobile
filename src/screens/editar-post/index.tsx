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
import { PostForm } from '@/components/PostForm';
import type { PostFormValues } from '@/components/PostForm';
import { useAuth } from '@/contexts/AuthContext';
import type { AppRoutesParamList } from '@/navigation/app.routes';

type Navigation = NativeStackNavigationProp<AppRoutesParamList>;
type EditarPostRoute = RouteProp<AppRoutesParamList, 'EditarPost'>;

type PostResponse = {
  _id: string;
  titulo: string;
  conteudo: string;
  autor: string;
  dataCriacao: string;
  __v?: number;
};

function normalizePost(data: unknown): PostResponse | null {
  const response = data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
  const post = (response?.data && typeof response.data === 'object'
    ? response.data
    : response) as Record<string, unknown> | null;

  if (!post) {
    return null;
  }

  return {
    _id: String(post._id ?? ''),
    titulo: String(post.titulo ?? ''),
    conteudo: String(post.conteudo ?? ''),
    autor: String(post.autor ?? ''),
    dataCriacao: String(post.dataCriacao ?? ''),
    __v: typeof post.__v === 'number' ? post.__v : undefined,
  };
}

export function EditarPostScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<EditarPostRoute>();
  const { isAuthenticated, token, user } = useAuth();
  const [formValues, setFormValues] = useState<PostFormValues>({
    titulo: '',
    conteudo: '',
    autor: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canEditPost = isAuthenticated && user?.role?.toLowerCase() === 'professor';

  const loadPost = useCallback(async () => {
    if (!canEditPost) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const response = await api.get(`/posts/${route.params.postId}`);
      const post = normalizePost(response.data);

      if (!post) {
        setError('Post nao encontrado.');
        return;
      }

      setFormValues({
        titulo: post.titulo,
        conteudo: post.conteudo,
        autor: post.autor,
      });
    } catch {
      setError('Nao foi possivel carregar o post.');
    } finally {
      setIsLoading(false);
    }
  }, [canEditPost, route.params.postId]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  async function handleUpdatePost() {
    if (!canEditPost || !token) {
      Alert.alert('Editar post', 'Acesso permitido somente para professor autenticado.');
      return;
    }

    if (!formValues.titulo.trim() || !formValues.conteudo.trim() || !formValues.autor.trim()) {
      Alert.alert('Editar post', 'Informe titulo, conteudo e autor.');
      return;
    }

    try {
      setIsSubmitting(true);

      await api.put(
        `/posts/${route.params.postId}`,
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

      Alert.alert('Editar post', 'Post atualizado com sucesso.');
      navigation.navigate('Administrativo');
    } catch {
      Alert.alert('Editar post', 'Nao foi possivel atualizar o post.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Editar Post" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}
      >
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          {!canEditPost ? (
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
              <Text style={styles.feedbackText}>Carregando post...</Text>
            </View>
          ) : error ? (
            <View style={styles.feedback}>
              <Text style={styles.feedbackTitle}>{error}</Text>
              <Pressable style={styles.restrictedButton} onPress={() => navigation.goBack()}>
                <Text style={styles.restrictedButtonText}>Voltar</Text>
              </Pressable>
            </View>
          ) : (
            <PostForm
              isSubmitting={isSubmitting}
              submitLabel="Atualizar"
              values={formValues}
              onCancel={() => navigation.goBack()}
              onChange={setFormValues}
              onSubmit={handleUpdatePost}
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
