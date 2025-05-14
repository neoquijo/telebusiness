import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../config';
//@ts-ignore
import { ServerResponse } from '../types/ServerResponse';


export const authApi = createApi({
  reducerPath: 'authApi',
  tagTypes: ['isAuth'],

  baseQuery: fetchBaseQuery({
    baseUrl: API_URL + '/auth',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (typeof token == 'string') {
        headers.set('Authorization', token)
      }
    }
  }),
  endpoints: (builder) => ({
    login: builder.mutation<ServerResponse<{ access_token: string }>, { username: string; password: string }>({
      invalidatesTags: ['isAuth'],
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    checkAuth: builder.query<ServerResponse<any>, string>({
      providesTags: ['isAuth'],
      query: (token) => ({
        url: '/me',
        method: 'POST',
        body: { token },
        headers: { authorization: token }
      }),
    }),
    refreshToken: builder.mutation<{ token: string }, void>({
      invalidatesTags: ['isAuth'],
      query: () => ({
        url: '/refresh',
        method: 'POST',
      }),
    }),
  }),
});

export const { useLoginMutation, useCheckAuthQuery, useRefreshTokenMutation, useLazyCheckAuthQuery } = authApi;
