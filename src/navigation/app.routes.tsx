import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen } from '@/screens/login';
import { PrincipalScreen } from '@/screens/principal';

export type AppRoutesParamList = {
  Principal: undefined;
  Login: undefined;
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
    </Stack.Navigator>
  );
}
