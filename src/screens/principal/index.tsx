import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { api } from '@/api/api';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import type { AppRoutesParamList } from '@/navigation/app.routes';

const POSTS_PER_PAGE = 5;

type Navigation = NativeStackNavigationProp<AppRoutesParamList>;

type Post = {
  _id?: string;
  id?: string | number;
  title?: string;
  titulo?: string;
  content?: string;
  conteudo?: string;
  body?: string;
  description?: string;
  descricao?: string;
  author?: string;
  autor?: string;
  createdAt?: string;
  dataCriacao?: string;
};

function normalizePosts(data: unknown): Post[] {
  if (Array.isArray(data)) {
    return data as Post[];
  }

  if (data && typeof data === 'object') {
    const response = data as Record<string, unknown>;
    const candidates = [response.data, response.posts, response.content, response.items];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate as Post[];
      }
    }
  }

  return [];
}

function getPostId(item: Post, index: number) {
  return String(item._id ?? item.id ?? index);
}

function getPostTitle(item: Post) {
  return item.title ?? item.titulo ?? 'Post sem titulo';
}

function getPostDescription(item: Post) {
  return item.content ?? item.conteudo ?? item.body ?? item.description ?? item.descricao ?? '';
}

function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trimEnd()}...`;
}

function getSearchableText(item: Post) {
  return [
    getPostTitle(item),
    getPostDescription(item),
    item.author,
    item.autor,
    item.createdAt,
    item.dataCriacao,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function PrincipalScreen() {
  const navigation = useNavigation<Navigation>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState('');
  const [visiblePostsCount, setVisiblePostsCount] = useState(POSTS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadPosts = useCallback(async (showRefresh = false) => {
    try {
      setError('');

      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await api.get('/posts');
      setPosts(normalizePosts(response.data));
    } catch {
      setError('Nao foi possivel carregar os posts.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const filteredPosts = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return posts;
    }

    return posts.filter((post) => getSearchableText(post).includes(term));
  }, [posts, search]);

  const visiblePosts = useMemo(
    () => filteredPosts.slice(0, visiblePostsCount),
    [filteredPosts, visiblePostsCount],
  );

  const hasMorePosts = visiblePostsCount < filteredPosts.length;

  function handleSearchChange(value: string) {
    setSearch(value);
    setVisiblePostsCount(POSTS_PER_PAGE);
  }

  function handleShowMore() {
    setVisiblePostsCount((current) => current + POSTS_PER_PAGE);
  }

  function handleOpenPost(item: Post, index: number) {
    navigation.navigate('ExibirPost', {
      postId: getPostId(item, index),
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />

      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.feedback}>
            <ActivityIndicator color="#0F766E" size="large" />
            <Text style={styles.feedbackText}>Carregando posts...</Text>
          </View>
        ) : (
          <FlatList
            data={visiblePosts}
            keyExtractor={getPostId}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                tintColor="#0F766E"
                onRefresh={() => loadPosts(true)}
              />
            }
            ListHeaderComponent={
              <View style={styles.searchContainer}>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  clearButtonMode="while-editing"
                  placeholder="Buscar posts por palavra-chave"
                  placeholderTextColor="#9CA3AF"
                  returnKeyType="search"
                  style={styles.searchInput}
                  value={search}
                  onChangeText={handleSearchChange}
                />
              </View>
            }
            ListFooterComponent={
              hasMorePosts ? (
                <Pressable style={styles.showMoreButton} onPress={handleShowMore}>
                  <Text style={styles.showMoreButtonText}>Exibir mais.</Text>
                </Pressable>
              ) : null
            }
            contentContainerStyle={visiblePosts.length === 0 ? styles.emptyList : styles.list}
            ListEmptyComponent={
              <View style={styles.feedback}>
                <Text style={styles.emptyTitle}>
                  {error ||
                    (search
                      ? 'Nenhum post encontrado para esta busca.'
                      : 'Nenhum post encontrado.')}
                </Text>
                <Text style={styles.emptyText}>Puxe para baixo para tentar novamente.</Text>
              </View>
            }
            renderItem={({ item, index }) => {
              const description = truncateText(getPostDescription(item), 128);

              return (
                <Pressable style={styles.card} onPress={() => handleOpenPost(item, index)}>
                  <Text style={styles.cardTitle}>{getPostTitle(item)}</Text>

                  {description ? (
                    <Text numberOfLines={4} style={styles.cardDescription}>
                      {description}
                    </Text>
                  ) : null}

                  {item.author || item.autor || item.createdAt || item.dataCriacao ? (
                    <View style={styles.metaRow}>
                      <Text style={styles.metaText}>{item.author ?? item.autor ?? 'Autor'}</Text>
                      <Text style={styles.metaText}>
                        {item.createdAt ?? item.dataCriacao ?? ''}
                      </Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            }}
          />
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
  list: {
    gap: 12,
    padding: 16,
  },
  emptyList: {
    flexGrow: 1,
    padding: 16,
  },
  searchContainer: {
    marginBottom: 4,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    borderRadius: 8,
    borderWidth: 1,
    color: '#111827',
    fontSize: 15,
    minHeight: 46,
    paddingHorizontal: 14,
  },
  showMoreButton: {
    alignItems: 'center',
    backgroundColor: '#0F766E',
    borderRadius: 8,
    justifyContent: 'center',
    marginTop: 4,
    minHeight: 46,
  },
  showMoreButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  cardTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
  },
  cardDescription: {
    color: '#374151',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginTop: 14,
  },
  metaText: {
    color: '#6B7280',
    flexShrink: 1,
    fontSize: 12,
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
  emptyTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
});
