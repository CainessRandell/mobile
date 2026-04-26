import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://fivam-backend-fiap-0-0-2.onrender.com/',
  timeout: 10000,
});
