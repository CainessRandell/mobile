import { SafeAreaView, StyleSheet, View } from 'react-native';

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { UserList } from '@/components/UserList';

export function ProfessoresScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Professores" />

      <View style={styles.content}>
        <UserList
          emptyMessage="Nenhum professor encontrado."
          role="professor"
          searchPlaceholder="Buscar professor"
          userLabel="professores"
        />
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
