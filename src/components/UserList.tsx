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
import { usePermissions } from '@/hooks/usePermissions';
import type { AppRoutesParamList } from '@/navigation/app.routes';

type Navigation = NativeStackNavigationProp<AppRoutesParamList>;
type UserRoleFilter = 'professor' | 'aluno';

type UserItem = {
  _id: string;
  nome: string;
  email: string;
  role: string;
  __v?: number;
};

type UserListProps = {
  emptyMessage: string;
  role: UserRoleFilter;
  searchPlaceholder: string;
  userLabel: string;
};

function normalizeUsers(data: unknown): UserItem[] {
  if (Array.isArray(data)) {
    return data as UserItem[];
  }

  if (data && typeof data === 'object') {
    const response = data as Record<string, unknown>;
    const candidates = [response.data, response.users, response.items];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate as UserItem[];
      }
    }
  }

  return [];
}

function getUserSearchText(user: UserItem) {
  return [user.nome, user.email, user.role].filter(Boolean).join(' ').toLowerCase();
}

type UserListItemProps = {
  confirmingDeleteUserId: string | null;
  deletingUserId: string | null;
  item: UserItem;
  onCancelDelete: () => void;
  onConfirmDelete: (user: UserItem) => void;
  onDelete: (user: UserItem) => void;
  onEdit: (user: UserItem) => void;
};

function ListSeparator() {
  return <View style={styles.separator} />;
}

function UserListItem({
  confirmingDeleteUserId,
  deletingUserId,
  item,
  onCancelDelete,
  onConfirmDelete,
  onDelete,
  onEdit,
}: UserListItemProps) {
  const isDeleting = deletingUserId === item._id;
  const isConfirmingDelete = confirmingDeleteUserId === item._id;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.nome || 'Sem nome'}</Text>
      <Text style={styles.cardText}>{item.email}</Text>
      <Text style={styles.cardMeta}>{item.role}</Text>

      <View style={styles.actions}>
        <Pressable style={styles.editButton} onPress={() => onEdit(item)}>
          <Text style={styles.editButtonText}>Editar</Text>
        </Pressable>

        <Pressable
          disabled={isDeleting}
          style={[styles.deleteButton, isDeleting && styles.disabledButton]}
          onPress={() => onDelete(item)}
        >
          {isDeleting ? (
            <ActivityIndicator color="#B91C1C" />
          ) : (
            <Text style={styles.deleteButtonText}>Delete</Text>
          )}
        </Pressable>
      </View>

      {isConfirmingDelete ? (
        <View style={styles.deleteConfirmation}>
          <Text style={styles.deleteConfirmationText}>Deseja remover este usuario?</Text>

          <View style={styles.deleteConfirmationActions}>
            <Pressable
              disabled={isDeleting}
              style={styles.cancelDeleteButton}
              onPress={onCancelDelete}
            >
              <Text style={styles.cancelDeleteButtonText}>Cancelar</Text>
            </Pressable>

            <Pressable
              disabled={isDeleting}
              style={[styles.confirmDeleteButton, isDeleting && styles.disabledButton]}
              onPress={() => onConfirmDelete(item)}
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
}

export function UserList({ emptyMessage, role, searchPlaceholder, userLabel }: UserListProps) {
  const navigation = useNavigation<Navigation>();
  const { token } = useAuth();
  const { canManageUsers } = usePermissions();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [confirmingDeleteUserId, setConfirmingDeleteUserId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const loadUsers = useCallback(async (showRefresh = false) => {
    if (!canManageUsers || !token) {
      setIsLoading(false);
      return;
    }

    try {
      setError('');

      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const response = await api.get('/users', {
        params: {
          role,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(normalizeUsers(response.data));
    } catch {
      setError(`Nao foi possivel carregar ${userLabel}.`);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [canManageUsers, role, token, userLabel]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return users;
    }

    return users.filter((user) => getUserSearchText(user).includes(term));
  }, [search, users]);

  const deleteUser = useCallback(async (user: UserItem) => {
    if (!canManageUsers || !token) {
      Alert.alert('Delete', 'Acesso permitido somente para professor autenticado.');
      return;
    }

    try {
      setDeletingUserId(user._id);

      await api.delete(`/users/${user._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setConfirmingDeleteUserId(null);
      Alert.alert('Delete', 'Usuario removido com sucesso.');
      await loadUsers(true);
    } catch {
      Alert.alert('Delete', 'Nao foi possivel remover o usuario.');
    } finally {
      setDeletingUserId(null);
    }
  }, [canManageUsers, loadUsers, token]);

  const handleEditUser = useCallback((user: UserItem) => {
    navigation.navigate('EditarUsuario', { userId: user._id });
  }, [navigation]);

  const handleDeleteUser = useCallback((user: UserItem) => {
    setConfirmingDeleteUserId(user._id);
  }, []);

  const handleCancelDelete = useCallback(() => {
    setConfirmingDeleteUserId(null);
  }, []);

  const renderUser = useCallback(
    ({ item }: { item: UserItem }) => (
      <UserListItem
        confirmingDeleteUserId={confirmingDeleteUserId}
        deletingUserId={deletingUserId}
        item={item}
        onCancelDelete={handleCancelDelete}
        onConfirmDelete={deleteUser}
        onDelete={handleDeleteUser}
        onEdit={handleEditUser}
      />
    ),
    [
      confirmingDeleteUserId,
      deletingUserId,
      deleteUser,
      handleCancelDelete,
      handleDeleteUser,
      handleEditUser,
    ],
  );

  const listHeader = useMemo(
    () => (
      <View style={styles.searchContainer}>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          placeholder={searchPlaceholder}
          placeholderTextColor="#9CA3AF"
          returnKeyType="search"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>
    ),
    [search, searchPlaceholder],
  );

  const emptyComponent = useMemo(
    () => (
      <View style={styles.feedback}>
        <Text style={styles.feedbackTitle}>{error || emptyMessage}</Text>
        <Text style={styles.feedbackText}>Puxe para baixo para tentar novamente.</Text>
      </View>
    ),
    [emptyMessage, error],
  );

  const flatListExtraData = useMemo(
    () => ({
      confirmingDeleteUserId,
      deletingUserId,
    }),
    [confirmingDeleteUserId, deletingUserId],
  );

  if (!canManageUsers) {
    return (
      <View style={styles.feedback}>
        <Text style={styles.feedbackTitle}>Acesso restrito</Text>
        <Text style={styles.feedbackText}>
          Esta tela e exibida apenas para professor autenticado.
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.feedback}>
        <ActivityIndicator color="#0F766E" size="large" />
        <Text style={styles.feedbackText}>Carregando {userLabel}...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={filteredUsers}
      extraData={flatListExtraData}
      style={styles.listContainer}
      keyExtractor={(item) => item._id}
      ItemSeparatorComponent={ListSeparator}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          tintColor="#0F766E"
          onRefresh={() => loadUsers(true)}
        />
      }
      ListHeaderComponent={listHeader}
      contentContainerStyle={filteredUsers.length === 0 ? styles.emptyList : styles.list}
      ListEmptyComponent={emptyComponent}
      renderItem={renderUser}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  listContainer: {
    flex: 1,
  },
  separator: {
    height: 12,
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
    fontWeight: '800',
  },
  cardText: {
    color: '#374151',
    fontSize: 14,
    marginTop: 6,
  },
  cardMeta: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
  },
  actions: {
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
  feedbackTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  feedbackText: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
});
