import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export type PostFormValues = {
  titulo: string;
  conteudo: string;
  autor: string;
};

type PostFormProps = {
  values: PostFormValues;
  submitLabel: string;
  isSubmitting: boolean;
  onCancel: () => void;
  onChange: (values: PostFormValues) => void;
  onSubmit: () => void;
};

export function PostForm({
  values,
  submitLabel,
  isSubmitting,
  onCancel,
  onChange,
  onSubmit,
}: PostFormProps) {
  function updateField(field: keyof PostFormValues, value: string) {
    onChange({
      ...values,
      [field]: value,
    });
  }

  return (
    <>
      <Text style={styles.label}>Titulo</Text>
      <TextInput
        placeholder="Informe o titulo"
        placeholderTextColor="#9CA3AF"
        style={styles.input}
        value={values.titulo}
        onChangeText={(value) => updateField('titulo', value)}
      />

      <Text style={styles.label}>Conteudo</Text>
      <TextInput
        multiline
        placeholder="Informe o conteudo"
        placeholderTextColor="#9CA3AF"
        style={[styles.input, styles.textArea]}
        textAlignVertical="top"
        value={values.conteudo}
        onChangeText={(value) => updateField('conteudo', value)}
      />

      <Text style={styles.label}>Autor</Text>
      <TextInput
        placeholder="Informe o autor"
        placeholderTextColor="#9CA3AF"
        style={styles.input}
        value={values.autor}
        onChangeText={(value) => updateField('autor', value)}
      />

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
            <Text style={styles.submitButtonText}>{submitLabel}</Text>
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
  textArea: {
    minHeight: 180,
    paddingTop: 12,
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
