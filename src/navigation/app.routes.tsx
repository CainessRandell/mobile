import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AdministrativoScreen } from '@/screens/administrativo';
import { CriarPostScreen } from '@/screens/criar-post';
import { LoginScreen } from '@/screens/login';
import { ExibirPostScreen } from '@/screens/post/ExibirPost';
import { PrincipalScreen } from '@/screens/principal';

export type AppRoutesParamList = {
  Principal: undefined;
  Login: undefined;
  Administrativo: undefined;
  CriarPost: undefined;
  ExibirPost: {
    postId: string;
  };
};

const Stack = createNativeStackNavigator<AppRoutesParamList>();

export function AppRoutes() {
  return (
    <Stack.Navigator
      initialRouteName="Principal"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Principal" component={PrincipalScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Administrativo" component={AdministrativoScreen} />
      <Stack.Screen name="CriarPost" component={CriarPostScreen} />
      <Stack.Screen name="ExibirPost" component={ExibirPostScreen} />
    </Stack.Navigator>
  );
}
