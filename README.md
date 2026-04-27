# Blog Mobile

Aplicativo mobile em Expo/React Native para listar, exibir, criar, editar e remover posts consumindo a API:

```text
https://fivam-backend-fiap-0-0-2.onrender.com/
```

## Criacao do Projeto

Comandos usados para iniciar a base do projeto:

```bash
npx create-expo-app mobile
npm install axios
npm install @react-navigation/native
npm install @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context expo-secure-store
```

## Instalar Dependencias

Dentro da pasta do projeto:

```bash
npm install
```

## Executar o Projeto

```bash
npx expo start -c
```

Para abrir no Android:

```bash
npx expo start --android
```

Ou inicie com `npx expo start -c` e use o Expo Go no celular.

## Estrutura Principal

```text
src/
 ├── api/
 │    └── api.ts
 ├── components/
 │    ├── Footer.tsx
 │    ├── Header.tsx
 │    ├── PostForm.tsx
 │    └── PostList.tsx
 ├── contexts/
 │    └── AuthContext.tsx
 ├── navigation/
 │    ├── app.routes.tsx
 │    └── routes.tsx
 ├── screens/
 │    ├── administrativo/
 │    ├── criar-post/
 │    ├── editar-post/
 │    ├── login/
 │    ├── post/
 │    └── principal/
 ├── App.tsx
 └── index.ts
```

## Funcionalidades

- Listagem de posts na tela principal.
- Busca local por palavra-chave.
- Exibicao inicial de 5 posts, com botao `Exibir mais.` para carregar mais 5.
- Conteudo do card limitado a 128 caracteres.
- Tela de detalhes do post com titulo, autor, data, conteudo e botao para exibir/ocultar `_id`.
- Login com email e senha em `/auth/login`.
- Armazenamento seguro do token com `expo-secure-store`.
- Menu hamburguer com `Home`, `Login` e opcoes administrativas quando o usuario for `professor`.
- Tela administrativa reaproveitando a listagem de posts.
- Criacao de post com `POST /posts`.
- Edicao de post com `PUT /posts/{id}`.
- Remocao de post com `DELETE /posts/{id}`.

## Autenticacao

O token retornado no login e armazenado no `AuthContext` usando `expo-secure-store` no Android/iOS.

As operacoes administrativas enviam:

```text
Authorization: Bearer <token>
```

As telas administrativas so ficam disponiveis quando:

```ts
isAuthenticated === true
user.role === 'professor'
```

## Scripts

```bash
npm run start
npm run android
npm run ios
npm run web
npm run lint
```
