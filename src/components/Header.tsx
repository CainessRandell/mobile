import { StyleSheet, Text, View } from 'react-native';

export function Header() {
  return (
    <View style={styles.container}>
      <Text style={styles.brand}>FIVAM</Text>
      <Text style={styles.title}>Posts</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F766E',
    paddingBottom: 18,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  brand: {
    color: '#CCFBF1',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 4,
  },
});
