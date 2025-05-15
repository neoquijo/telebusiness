// src/API/filtersApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../config';
import { FilteredResponse } from './types';

export interface MessageFilter {
  id: string;
  name: string;
  includesText: string[];
  excludesText: string[];
  regexp?: string;
  callbackTopic?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateFilterDto {
  name: string;
  includesText?: string[];
  excludesText?: string[];
  regexp?: string;
  callbackTopic?: string;
}

export interface UpdateFilterDto {
  name?: string;
  includesText?: string[];
  excludesText?: string[];
  regexp?: string;
  callbackTopic?: string;
}

export interface TestFilterResponse {
  filterId: string;
  filterName: string;
  messageText: string;
  matches: boolean;
}

export const filtersApi = createApi({
  reducerPath: 'filtersApi',
  tagTypes: ['filters'],
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL + '/filters',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (typeof token === 'string') {
        headers.set('Authorization', token);
      }
    }
  }),
  endpoints: (builder) => ({
    getFilters: builder.query<FilteredResponse<MessageFilter>, string>({
      query: (queryParams) => ({
        url: queryParams ? `/?${queryParams}` : '/',
        method: 'GET'
      }),
      providesTags: ['filters']
    }),
    getFilter: builder.query<MessageFilter, string>({
      query: (id) => `/${id}`,
      providesTags: (_, __, id) => [{ type: 'filters', id }]
    }),
    createFilter: builder.mutation<MessageFilter, CreateFilterDto>({
      query: (data) => ({
        url: '/',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['filters']
    }),
    updateFilter: builder.mutation<MessageFilter, { id: string; data: UpdateFilterDto }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'filters', id }, 'filters']
    }),
    deleteFilter: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['filters']
    }),
    testFilter: builder.mutation<TestFilterResponse, { id: string; messageText: string }>({
      query: ({ id, messageText }) => ({
        url: `/${id}/test`,
        method: 'POST',
        body: { messageText }
      })
    })
  })
});

export const {
  useGetFiltersQuery,
  useGetFilterQuery,
  useCreateFilterMutation,
  useUpdateFilterMutation,
  useDeleteFilterMutation,
  useTestFilterMutation
} = filtersApi;