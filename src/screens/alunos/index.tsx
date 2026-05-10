import { SafeAreaView, StyleSheet, View } from 'react-native';

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { UserList } from '@/components/UserList';

export function AlunosScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="Alunos" />

      <View style={styles.content}>
        <UserList
          emptyMessage="Nenhum aluno encontrado."
          role="aluno"
          searchPlaceholder="Buscar aluno"
          userLabel="alunos"
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
