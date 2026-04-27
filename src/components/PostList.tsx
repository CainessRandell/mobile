import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { api } from '@/api/api';
import { useAuth } from '@/contexts/AuthContext';
import type { AppRoutesParamList } from '@/navigation/app.routes';

const POSTS_PER_PAGE = 5;

type Navigation = NativeStackNavigationProp<AppRoutesParamList>;

type Post = {
  _id: string;
  titulo: string;
  conteudo: string;
  autor: string;
  dataCriacao: string;
  __v?: number;
};

function normalizePosts(data: unknown): Post[] {
  if (Array.isArray(data)) {
    return data as Post[];
  }

  if (data && typeof data === 'object') {
    const response = data as Record<string, unknown>;
    const candidates = [response.data, response.posts, response.items];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate as Post[];
      }
    }
  }

  return [];
}

function getPostId(item: Post) {
  return item._id;
}

function getPostTitle(item: Post) {
  return item.titulo || 'Post sem titulo';
}

function getPostDescription(item: Post) {
  return item.conteudo || '';
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
    item.autor,
    item.dataCriacao,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

type PostListProps = {
  showEditButton?: boolean;
  emptyMessage?: string;
};

export function PostList({
  showEditButton = false,
  emptyMessage = 'Nenhum post encontrado.',
}: PostListProps) {
  const navigation = useNavigation<Navigation>();
  const { isAuthenticated, token, user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [search, setSearch] = useState('');
  const [visiblePostsCount, setVisiblePostsCount] = useState(POSTS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [confirmingDeletePostId, setConfirmingDeletePostId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const canManagePosts = isAuthenticated && user?.role?.toLowerCase() === 'professor' && Boolean(token);

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

  function handleOpenPost(item: Post) {
    navigation.navigate('ExibirPost', {
      postId: getPostId(item),
    });
  }

  function handleEditPost(item: Post) {
    navigation.navigate('EditarPost', {
      postId: getPostId(item),
    });
  }

  async function deletePost(item: Post) {
    if (!canManagePosts || !token) {
      Alert.alert('Delete', 'Acesso permitido somente para professor autenticado.');
      return;
    }

    try {
      const postId = getPostId(item);
      setDeletingPostId(postId);

      await api.delete(`/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setConfirmingDeletePostId(null);
      Alert.alert('Delete', 'Post removido com sucesso.');
      await loadPosts(true);
    } catch {
      Alert.alert('Delete', 'Nao foi possivel remover o post.');
    } finally {
      setDeletingPostId(null);
    }
  }

  function handleDeletePost(item: Post) {
    setConfirmingDeletePostId(getPostId(item));
  }

  if (isLoading) {
    return (
      <View style={styles.feedback}>
        <ActivityIndicator color="#0F766E" size="large" />
        <Text style={styles.feedbackText}>Carregando posts...</Text>
      </View>
    );
  }

  return (
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
              (search ? 'Nenhum post encontrado para esta busca.' : emptyMessage)}
          </Text>
          <Text style={styles.emptyText}>Puxe para baixo para tentar novamente.</Text>
        </View>
      }
      renderItem={({ item }) => {
        const description = truncateText(getPostDescription(item), 128);
        const postId = getPostId(item);
        const isConfirmingDelete = confirmingDeletePostId === postId;
        const isDeleting = deletingPostId === postId;

        return (
          <View style={styles.card}>
            <Pressable onPress={() => handleOpenPost(item)}>
              <Text style={styles.cardTitle}>{getPostTitle(item)}</Text>

              {description ? (
                <Text numberOfLines={4} style={styles.cardDescription}>
                  {description}
                </Text>
              ) : null}

              {item.autor || item.dataCriacao ? (
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>{item.autor || 'Autor'}</Text>
                  <Text style={styles.metaText}>{item.dataCriacao}</Text>
                </View>
              ) : null}
            </Pressable>

            {showEditButton && canManagePosts ? (
              <View style={styles.adminActions}>
                <Pressable style={styles.editButton} onPress={() => handleEditPost(item)}>
                  <Text style={styles.editButtonText}>Editar</Text>
                </Pressable>

                <Pressable
                  disabled={isDeleting}
                  style={[
                    styles.deleteButton,
                    isDeleting && styles.disabledButton,
                  ]}
                  onPress={() => handleDeletePost(item)}
                >
                  {isDeleting ? (
                    <ActivityIndicator color="#B91C1C" />
                  ) : (
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  )}
                </Pressable>
              </View>
            ) : null}

            {showEditButton && canManagePosts && isConfirmingDelete ? (
              <View style={styles.deleteConfirmation}>
                <Text style={styles.deleteConfirmationText}>Deseja remover este post?</Text>

                <View style={styles.deleteConfirmationActions}>
                  <Pressable
                    disabled={isDeleting}
                    style={styles.cancelDeleteButton}
                    onPress={() => setConfirmingDeletePostId(null)}
                  >
                    <Text style={styles.cancelDeleteButtonText}>Cancelar</Text>
                  </Pressable>

                  <Pressable
                    disabled={isDeleting}
                    style={[styles.confirmDeleteButton, isDeleting && styles.disabledButton]}
                    onPress={() => deletePost(item)}
                  >
                    {isDeleting ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.confirmDeleteButtonText}>Confirmar delete</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            ) : null}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
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
  adminActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
    marginTop: 14,
  },
  editButton: {
    alignItems: 'center',
    borderColor: '#0F766E',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  editButtonText: {
    color: '#0F766E',
    fontSize: 14,
    fontWeight: '800',
  },
  deleteButton: {
    alignItems: 'center',
    borderColor: '#B91C1C',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  deleteButtonText: {
    color: '#B91C1C',
    fontSize: 14,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.6,
  },
  deleteConfirmation: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 12,
  },
  deleteConfirmationText: {
    color: '#7F1D1D',
    fontSize: 14,
    fontWeight: '700',
  },
  deleteConfirmationActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  cancelDeleteButton: {
    alignItems: 'center',
    borderColor: '#9CA3AF',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  cancelDeleteButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '800',
  },
  confirmDeleteButton: {
    alignItems: 'center',
    backgroundColor: '#B91C1C',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  confirmDeleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
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
