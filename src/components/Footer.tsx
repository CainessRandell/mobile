import { StyleSheet, Text, View } from 'react-native';

export function Footer() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>FIVAM Mobile</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderTopColor: '#E5E7EB',
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  text: {
    color: '#6B7280',
    fontSize: 12,
  },
});
