import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export type UserRole = 'professor' | 'aluno';

export type UserFormValues = {
  nome: string;
  email: string;
  senha: string;
  confirmacaoSenha: string;
  role: UserRole;
};

type UserFormProps = {
  values: UserFormValues;
  isSubmitting: boolean;
  onCancel: () => void;
  onChange: (values: UserFormValues) => void;
  onSubmit: () => void;
};

export function UserForm({
  values,
  isSubmitting,
  onCancel,
  onChange,
  onSubmit,
}: UserFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  function updateField(field: keyof UserFormValues, value: string) {
    onChange({
      ...values,
      [field]: value,
    });
  }

  function updateRole(role: UserRole) {
    onChange({
      ...values,
      role,
    });
  }

  return (
    <>
      <Text style={styles.label}>Nome</Text>
      <TextInput
        placeholder="Informe o nome"
        placeholderTextColor="#9CA3AF"
        style={styles.input}
        value={values.nome}
        onChangeText={(value) => updateField('nome', value)}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="email@exemplo.com"
        placeholderTextColor="#9CA3AF"
        style={styles.input}
        value={values.email}
        onChangeText={(value) => updateField('email', value)}
      />

      <Text style={styles.label}>Senha</Text>
      <View style={styles.passwordRow}>
        <TextInput
          autoCapitalize="none"
          placeholder="Informe a senha"
          placeholderTextColor="#9CA3AF"
          secureTextEntry={!showPassword}
          style={styles.passwordInput}
          value={values.senha}
          onChangeText={(value) => updateField('senha', value)}
        />
        <Pressable
          accessibilityRole="button"
          style={styles.passwordToggle}
          onPress={() => setShowPassword((current) => !current)}
        >
          <Text style={styles.passwordToggleText}>{showPassword ? 'Ocultar' : 'Mostrar'}</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Confirmar senha</Text>
      <View style={styles.passwordRow}>
        <TextInput
          autoCapitalize="none"
          placeholder="Confirme a senha"
          placeholderTextColor="#9CA3AF"
          secureTextEntry={!showPasswordConfirmation}
          style={styles.passwordInput}
          value={values.confirmacaoSenha}
          onChangeText={(value) => updateField('confirmacaoSenha', value)}
        />
        <Pressable
          accessibilityRole="button"
          style={styles.passwordToggle}
          onPress={() => setShowPasswordConfirmation((current) => !current)}
        >
          <Text style={styles.passwordToggleText}>
            {showPasswordConfirmation ? 'Ocultar' : 'Mostrar'}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Role</Text>
      <View style={styles.roleGroup}>
        <Pressable
          style={[styles.roleOption, values.role === 'professor' && styles.activeRoleOption]}
          onPress={() => updateRole('professor')}
        >
          <Text
            style={[
              styles.roleOptionText,
              values.role === 'professor' && styles.activeRoleOptionText,
            ]}
          >
            professor
          </Text>
        </Pressable>

        <Pressable
          style={[styles.roleOption, values.role === 'aluno' && styles.activeRoleOption]}
          onPress={() => updateRole('aluno')}
        >
          <Text
            style={[
              styles.roleOptionText,
              values.role === 'aluno' && styles.activeRoleOptionText,
            ]}
          >
            aluno
          </Text>
        </Pressable>
      </View>

      <View style={styles.actions}>
        <Pressable
          disabled={isSubmitting}
          style={[styles.cancelButton, isSubmitting && styles.disabledButton]}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </Pressable>

        <Pressable
          disabled={isSubmitting}
          style={[styles.submitButton, isSubmitting && styles.disabledButton]}
          onPress={onSubmit}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Atualizar</Text>
          )}
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    borderRadius: 8,
    borderWidth: 1,
    color: '#111827',
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  passwordRow: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 48,
  },
  passwordInput: {
    color: '#111827',
    flex: 1,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  passwordToggle: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 12,
  },
  passwordToggleText: {
    color: '#0F766E',
    fontSize: 13,
    fontWeight: '800',
  },
  roleGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  roleOption: {
    alignItems: 'center',
    borderColor: '#D1D5DB',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  activeRoleOption: {
    backgroundColor: '#0F766E',
    borderColor: '#0F766E',
  },
  roleOptionText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '800',
  },
  activeRoleOptionText: {
    color: '#FFFFFF',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  cancelButton: {
    alignItems: 'center',
    borderColor: '#B91C1C',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    width: '46%',
  },
  cancelButtonText: {
    color: '#B91C1C',
    fontSize: 15,
    fontWeight: '800',
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: '#0F766E',
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 48,
    width: '46%',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.7,
  },
});
