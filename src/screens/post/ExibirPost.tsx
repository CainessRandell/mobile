import { useCallback, useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
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
import type { AppRoutesParamList } from '@/navigation/app.routes';

type Navigation = NativeStackNavigationProp<AppRoutesParamList>;
type ExibirPostRoute = RouteProp<AppRoutesParamList, 'ExibirPost'>;

type PostDetail = {
  _id: string;
  titulo: string;
  conteudo: string;
  autor: string;
  dataCriacao: string;
  __v?: number;
};

function normalizePostDetail(data: unknown): PostDetail | null {
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

export function ExibirPostScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<ExibirPostRoute>();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showId, setShowId] = useState(false);

  const loadPost = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await api.get(`/posts/${route.params.postId}`);
      const normalizedPost = normalizePostDetail(response.data);

      if (!normalizedPost) {
        setError('Post nao encontrado.');
        return;
      }

      setPost(normalizedPost);
    } catch {
      setError('Nao foi possivel carregar o post.');
    } finally {
      setIsLoading(false);
    }
  }, [route.params.postId]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Post" />

      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.feedback}>
            <ActivityIndicator color="#0F766E" size="large" />
            <Text style={styles.feedbackText}>Carregando post...</Text>
          </View>
        ) : error || !post ? (
          <View style={styles.feedback}>
            <Text style={styles.errorText}>{error || 'Post nao encontrado.'}</Text>
            <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('Principal')}>
              <Text style={styles.primaryButtonText}>Retornar</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.postContent}>
            <Text style={styles.title}>{post.titulo || 'Post sem titulo'}</Text>

            <View style={styles.metaRow}>
              <Text style={styles.metaText}>{post.autor || 'Autor'}</Text>
              <Text style={styles.metaText}>{post.dataCriacao}</Text>
            </View>

            <Pressable style={styles.idButton} onPress={() => setShowId((current) => !current)}>
              <Text style={styles.idButtonText}>{showId ? 'Ocultar _id' : 'Exibir _id'}</Text>
            </Pressable>

            {showId ? (
              <View style={styles.idBox}>
                <Text style={styles.idText}>{post._id}</Text>
              </View>
            ) : null}

            <Text style={styles.body}>{post.conteudo || 'Sem conteudo.'}</Text>

            <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('Principal')}>
              <Text style={styles.primaryButtonText}>Retornar para tela principal</Text>
            </Pressable>
          </ScrollView>
        )}
      </View>

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
  postContent: {
    padding: 16,
  },
  title: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '800',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginTop: 10,
  },
  metaText: {
    color: '#6B7280',
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  idButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderColor: '#0F766E',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  idButtonText: {
    color: '#0F766E',
    fontSize: 14,
    fontWeight: '800',
  },
  idBox: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
    padding: 12,
  },
  idText: {
    color: '#374151',
    fontSize: 13,
  },
  body: {
    color: '#1F2937',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 22,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#0F766E',
    borderRadius: 8,
    justifyContent: 'center',
    marginTop: 24,
    minHeight: 48,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  feedback: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  feedbackText: {
    color: '#4B5563',
    fontSize: 14,
    marginTop: 12,
  },
  errorText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
