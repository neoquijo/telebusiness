import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../config';
import { NormalizedDialog } from '../modules/AccountsModule/types';
import { FilteredResponse } from './types';

export interface ChatImports {
  chats: NormalizedDialog[];
  makePublic: boolean;
  collectionName?: string;
}

export interface ImportChatsResponse {
  success: boolean;
  imported: number;
  chats: any[];
}

export const chatsApi = createApi({
  reducerPath: 'chatsApi',
  tagTypes: ['chats'],
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL + '/chats',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (typeof token == 'string') {
        headers.set('Authorization', token)
      }
    }
  }),
  endpoints: (builder) => ({
    deleteChat: builder.mutation<unknown, { id: string }>({
      query: data => ({
        url: '/delete',
        method: "POST",
        body: data
      }),
      invalidatesTags: ['chats']
    }),
    getChats: builder.query<FilteredResponse<NormalizedDialog>, string>({
      query: (queryParams) => ({
        url: `/my?${queryParams}`,
        method: 'GET'
      }),
      providesTags: ['chats']
    }),
    importChats: builder.mutation<ImportChatsResponse, ChatImports & { accountId: string }>({
      query: ({ accountId, ...data }) => ({
        url: `/import/${accountId}`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['chats']
    }),
  }),
});

export const {
  useDeleteChatMutation,
  useImportChatsMutation,
  useGetChatsQuery,
} = chatsApi;
