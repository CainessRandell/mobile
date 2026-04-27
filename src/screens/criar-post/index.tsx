import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
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
  TextInput,
  View,
} from 'react-native';

import { api } from '@/api/api';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import type { AppRoutesParamList } from '@/navigation/app.routes';

type Navigation = NativeStackNavigationProp<AppRoutesParamList>;

export function CriarPostScreen() {
  const navigation = useNavigation<Navigation>();
  const { isAuthenticated, token, user } = useAuth();
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [autor, setAutor] = useState(user?.nome ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canCreatePost = isAuthenticated && user?.role?.toLowerCase() === 'professor';

  useEffect(() => {
    setAutor((current) => current || user?.nome || '');
  }, [user?.nome]);

  async function handleCreatePost() {
    if (!canCreatePost || !token) {
      Alert.alert('Criar post', 'Acesso permitido somente para professor autenticado.');
      return;
    }

    if (!titulo.trim() || !conteudo.trim() || !autor.trim()) {
      Alert.alert('Criar post', 'Informe titulo, conteudo e autor.');
      return;
    }

    try {
      setIsSubmitting(true);

      await api.post(
        '/posts',
        {
          titulo: titulo.trim(),
          conteudo: conteudo.trim(),
          autor: autor.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      Alert.alert('Criar post', 'Post criado com sucesso.');
      navigation.navigate('Administrativo');
    } catch {
      Alert.alert('Criar post', 'Nao foi possivel criar o post.');
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
            <>
              <Text style={styles.label}>Titulo</Text>
              <TextInput
                placeholder="Informe o titulo"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                value={titulo}
                onChangeText={setTitulo}
              />

              <Text style={styles.label}>Conteudo</Text>
              <TextInput
                multiline
                placeholder="Informe o conteudo"
                placeholderTextColor="#9CA3AF"
                style={[styles.input, styles.textArea]}
                textAlignVertical="top"
                value={conteudo}
                onChangeText={setConteudo}
              />

              <Text style={styles.label}>Autor</Text>
              <TextInput
                placeholder="Informe o autor"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                value={autor}
                onChangeText={setAutor}
              />

              <View style={styles.actions}>
                <Pressable
                  disabled={isSubmitting}
                  style={[styles.cancelButton, isSubmitting && styles.disabledButton]}
                  onPress={() => navigation.goBack()}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </Pressable>

                <Pressable
                  disabled={isSubmitting}
                  style={[styles.createButton, isSubmitting && styles.disabledButton]}
                  onPress={handleCreatePost}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.createButtonText}>Criar</Text>
                  )}
                </Pressable>
              </View>
            </>
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
  textArea: {
    minHeight: 180,
    paddingTop: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  cancelButton: {
    alignItems: 'center',
    borderColor: '#B91C1C',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    width: '46%',
  },
  cancelButtonText: {
    color: '#B91C1C',
    fontSize: 15,
    fontWeight: '800',
  },
  createButton: {
    alignItems: 'center',
    backgroundColor: '#0F766E',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 48,
    width: '46%',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.7,
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
