import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AdministrativoScreen } from '@/screens/administrativo';
import { AlunosScreen } from '@/screens/alunos';
import { CriarPostScreen } from '@/screens/criar-post';
import { CriarUsuarioScreen } from '@/screens/criar-usuario';
import { EditarPostScreen } from '@/screens/editar-post';
import { EditarUsuarioScreen } from '@/screens/editar-usuario';
import { LoginScreen } from '@/screens/login';
import { ExibirPostScreen } from '@/screens/post/ExibirPost';
import { ProfessoresScreen } from '@/screens/professores';
import { PrincipalScreen } from '@/screens/principal';

export type AppRoutesParamList = {
  Principal: undefined;
  Login: undefined;
  Administrativo: undefined;
  CriarPost: undefined;
  CriarUsuario: undefined;
  Professores: undefined;
  Alunos: undefined;
  EditarUsuario: {
    userId: string;
  };
  EditarPost: {
    postId: string;
  };
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
      <Stack.Screen name="CriarUsuario" component={CriarUsuarioScreen} />
      <Stack.Screen name="Professores" component={ProfessoresScreen} />
      <Stack.Screen name="Alunos" component={AlunosScreen} />
      <Stack.Screen name="EditarUsuario" component={EditarUsuarioScreen} />
      <Stack.Screen name="EditarPost" component={EditarPostScreen} />
      <Stack.Screen name="ExibirPost" component={ExibirPostScreen} />
    </Stack.Navigator>
  );
}
