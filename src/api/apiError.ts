import axios from 'axios';

type ApiErrorData = {
  error?: unknown;
  message?: unknown;
  errors?: unknown;
};

function getFirstString(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const message = getFirstString(item);

      if (message) {
        return message;
      }
    }
  }

  if (value && typeof value === 'object') {
    const data = value as Record<string, unknown>;

    return getFirstString(data.error) || getFirstString(data.message);
  }

  return '';
}

export function getApiErrorMessage(error: unknown, fallbackMessage: string) {
  if (!axios.isAxiosError<ApiErrorData>(error)) {
    return fallbackMessage;
  }

  const data = error.response?.data;
  const status = error.response?.status;
  const apiMessage =
    getFirstString(data?.error) ||
    getFirstString(data?.message) ||
    getFirstString(data?.errors);

  if (apiMessage) {
    return apiMessage;
  }

  if (status === 400) {
    return 'Erro de validacao.';
  }

  if (status === 401) {
    return 'Nao autorizado.';
  }

  if (status === 403) {
    return 'Acesso negado: Requer permissao de professor.';
  }

  if (status === 404) {
    return 'Registro nao encontrado.';
  }

  return fallbackMessage;
}
