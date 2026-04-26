import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/contexts/AuthContext';
import { Routes } from '@/navigation/routes';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Routes />
        <StatusBar style="light" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
