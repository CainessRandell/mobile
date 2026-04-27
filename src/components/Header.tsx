import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AppRoutesParamList } from '@/navigation/app.routes';

type HeaderProps = {
  title?: string;
};

type Navigation = NativeStackNavigationProp<AppRoutesParamList>;
type MenuRoute = 'Principal' | 'Login';

export function Header({ title = 'Posts' }: HeaderProps) {
  const navigation = useNavigation<Navigation>();
  const route = useRoute();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function handleNavigate(routeName: MenuRoute) {
    setIsMenuOpen(false);
    navigation.navigate(routeName);
  }

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.brand}>FIVAM</Text>
          <Text style={styles.title}>{title}</Text>
        </View>

        <Pressable
          accessibilityLabel="Abrir menu"
          accessibilityRole="button"
          hitSlop={8}
          style={styles.menuButton}
          onPress={() => setIsMenuOpen((current) => !current)}
        >
          <Ionicons color="#FFFFFF" name={isMenuOpen ? 'close' : 'menu'} size={28} />
        </Pressable>
      </View>

      {isMenuOpen ? (
        <View style={styles.menu}>
          <Pressable
            style={[styles.menuItem, route.name === 'Principal' && styles.activeMenuItem]}
            onPress={() => handleNavigate('Principal')}
          >
            <Text style={styles.menuText}>Home</Text>
          </Pressable>

          <Pressable
            style={[styles.menuItem, route.name === 'Login' && styles.activeMenuItem]}
            onPress={() => handleNavigate('Login')}
          >
            <Text style={styles.menuText}>Login</Text>
          </Pressable>
        </View>
      ) : null}
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
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  menuButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  menu: {
    borderTopColor: '#14B8A6',
    borderTopWidth: 1,
    marginTop: 16,
    paddingTop: 8,
  },
  menuItem: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  activeMenuItem: {
    backgroundColor: '#0D9488',
  },
  menuText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
