import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../config';
import { Account, AccountData, VerifyAcount } from '../types/Account';


export const accountsApi = createApi({
  reducerPath: 'accountsApi',
  tagTypes: ['accounts', 'accountChats'],

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

    deleteUser: builder.mutation<unknown, { id: string }>({
      query: data => ({
        url: '/delete',
        method: "POST",
        body: data
      }),
      invalidatesTags: ['accounts']
    }),

    getAccounts: builder.query<Account[], string>({
      providesTags: ['accounts'],
      query: (query) => ({
        url: query ? '/' + query : '/',
        method: 'GET'
      })
    }),

    sendCode: builder.mutation({
      query: data => ({
        url: '/sendCode',
        method: 'POST',
        body: data
      })
    }),

    verifyCode: builder.mutation<AccountData, VerifyAcount>({
      query: data => ({
        url: '/verifyCode',
        method: 'POST',
        body: data
      })
    }),

    createAccount: builder.mutation({
      query: data => ({
        url: '/create',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['accounts']
    }),

    deleteAccount: builder.mutation<{ success: boolean }, { id: string }>({
      query: data => ({
        url: '/delete',
        method: 'POST',
        body: data
      })
    }),

    getAccount: builder.query({
      query: data => ({
        url: '/' + data,
        method: 'GET',
      })
    }),

    getAccountChats: builder.query({
      query: data => ({
        url: '/chats/' + data,
        method: 'GET',
      }),
      providesTags: ['accountChats']
    },
    )
  }),
});

export const {
  useSendCodeMutation,
  useDeleteUserMutation,
  useVerifyCodeMutation,
  useDeleteAccountMutation,
  useCreateAccountMutation,

  useGetAccountChatsQuery,
  useGetAccountQuery,
  useGetAccountsQuery,
} = accountsApi;
