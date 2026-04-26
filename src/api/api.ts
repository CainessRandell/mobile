import axios from 'axios';

const bearerToken = process.env.EXPO_PUBLIC_API_TOKEN;

export const api = axios.create({
  baseURL: 'https://fivam-backend-fiap-0-0-2.onrender.com/',
  headers: bearerToken
    ? {
        Authorization: `Bearer ${bearerToken}`,
      }
    : undefined,
  timeout: 10000,
});
