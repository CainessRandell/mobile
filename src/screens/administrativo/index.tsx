import { SafeAreaView, StyleSheet, View } from 'react-native';

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { PostList } from '@/components/PostList';

export function AdministrativoScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Administrativo" />

      <View style={styles.content}>
        <PostList emptyMessage="Nenhum post encontrado na area administrativa." />
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
});
