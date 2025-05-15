import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../config';
import { FilteredResponse } from './types';

export interface TelegramMessage {
  id: string;
  sender?: number;
  sourceType: 'Chat' | 'Channel' | 'Private' | 'Group';
  accountId: number;
  accountString: string;
  messageMedia: any[];
  messageText: string;
  filtered: any[];
  filterNames: string[];
  generatedTags: string[];
  lang?: string;
  createdAt: number;
  updatedAt: number;
}

export interface MessageStatistics {
  totalMessages: number;
  filteredMessages: number;
  filteredPercentage: string;
  topFilters: Array<{
    _id: string;
    count: number;
    filterName: string;
  }>;
  topAccounts: Array<{
    _id: string;
    count: number;
  }>;
}

export const messagesApi = createApi({
  reducerPath: 'messagesApi',
  tagTypes: ['messages', 'statistics'],
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL + '/messages',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (typeof token === 'string') {
        headers.set('Authorization', token);
      }
    }
  }),
  endpoints: (builder) => ({
    getMessages: builder.query<FilteredResponse<TelegramMessage>, string>({
      query: (queryParams) => ({
        url: queryParams ? `/?${queryParams}` : '/',
        method: 'GET'
      }),
      providesTags: ['messages']
    }),
    getFilteredMessages: builder.query<FilteredResponse<TelegramMessage>, string>({
      query: (queryParams) => ({
        url: queryParams ? `/filtered?${queryParams}` : '/filtered',
        method: 'GET'
      }),
      providesTags: ['messages']
    }),
    getMessagesByFilter: builder.query<FilteredResponse<TelegramMessage>, { filterId: string; queryParams?: string }>({
      query: ({ filterId, queryParams }) => ({
        url: queryParams ? `/by-filter/${filterId}?${queryParams}` : `/by-filter/${filterId}`,
        method: 'GET'
      }),
      providesTags: ['messages']
    }),
    getMessageStatistics: builder.query<MessageStatistics, string>({
      query: (queryParams) => ({
        url: queryParams ? `/statistics?${queryParams}` : '/statistics',
        method: 'GET'
      }),
      providesTags: ['statistics']
    }),
    getMessage: builder.query<TelegramMessage, string>({
      query: (id) => `/${id}`,
      providesTags: (_, __, id) => [{ type: 'messages', id }]
    })
  })
});

export const {
  useGetMessagesQuery,
  useGetFilteredMessagesQuery,
  useGetMessagesByFilterQuery,
  useGetMessageStatisticsQuery,
  useGetMessageQuery
} = messagesApi;