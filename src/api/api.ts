import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://fivam-backend-fiap-0-0-2.onrender.com/',
  timeout: 10000,
});

export function setApiAuthToken(token: string) {
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export function clearApiAuthToken() {
  delete api.defaults.headers.common.Authorization;
}
