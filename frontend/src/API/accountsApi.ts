// frontend/src/API/accountsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../config';
import { Account, AccountData, VerifyAcount } from '../types/Account';

export interface EditAccountRequest {
  id: string;
  name: string;
}

export interface UpdateSessionRequest {
  id: string;
  session: string;
  accountName?: string;
}

export const accountsApi = createApi({
  reducerPath: 'accountsApi',
  tagTypes: ['accounts', 'accountChats', 'account'],

  baseQuery: fetchBaseQuery({
    baseUrl: API_URL + '/accounts',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (typeof token == 'string') {
        headers.set('Authorization', token)
      }
    }
  }),

  endpoints: (builder) => ({
    // Получение списка аккаунтов
    getAccounts: builder.query<Account[], string>({
      query: (query) => ({
        url: query ? '/' + query : '/',
        method: 'GET'
      }),
      providesTags: ['accounts']
    }),

    // Получение конкретного аккаунта
    getAccount: builder.query({
      query: (id) => ({
        url: '/' + id,
        method: 'GET',
      }),
      providesTags: (_, __, id) => [{ type: 'account', id }]
    }),

    // Получение списка чатов аккаунта
    getAccountChats: builder.query({
      query: (data) => ({
        url: '/chats/' + data,
        method: 'GET',
      }),
      providesTags: ['accountChats']
    }),

    // Отправка кода подтверждения
    sendCode: builder.mutation({
      query: data => ({
        url: '/sendCode',
        method: 'POST',
        body: data
      })
    }),

    // Проверка кода и получение сессии
    verifyCode: builder.mutation<AccountData, VerifyAcount>({
      query: data => ({
        url: '/verifyCode',
        method: 'POST',
        body: data
      })
    }),

    // Создание нового аккаунта
    createAccount: builder.mutation({
      query: data => ({
        url: '/create',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['accounts']
    }),

    // Обновление сессии существующего аккаунта
    updateAccountSession: builder.mutation<{ success: boolean, account: Account }, UpdateSessionRequest>({
      query: data => ({
        url: '/update-session',
        method: 'POST',
        body: data
      }),
      invalidatesTags: (_, __, arg) => [
        'accounts',
        { type: 'account', id: arg.id }
      ]
    }),

    // Редактирование аккаунта
    editAccount: builder.mutation<Account, EditAccountRequest>({
      query: ({ id, ...data }) => ({
        url: '/edit',
        method: 'PUT',
        body: { id, ...data }
      }),
      invalidatesTags: (_, __, arg) => [
        'accounts',
        { type: 'account', id: arg.id }
      ]
    }),

    // Обновление сессии аккаунта
    refreshSession: builder.mutation<{ success: boolean }, { id: string }>({
      query: ({ id }) => ({
        url: '/refresh-session',
        method: 'POST',
        body: { id }
      }),
      invalidatesTags: (_, __, arg) => [
        'accounts',
        { type: 'account', id: arg.id }
      ]
    }),

    // Удаление аккаунта
    deleteAccount: builder.mutation<{ success: boolean }, { id: string }>({
      query: data => ({
        url: '/delete',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['accounts']
    }),
  }),
});

export const {
  useSendCodeMutation,
  useVerifyCodeMutation,
  useCreateAccountMutation,
  useDeleteAccountMutation,
  useEditAccountMutation,
  useRefreshSessionMutation,
  useUpdateAccountSessionMutation,
  useGetAccountQuery,
  useGetAccountChatsQuery,
  useGetAccountsQuery,
} = accountsApi;