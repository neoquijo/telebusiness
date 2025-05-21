import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../config';
import { FilteredResponse } from './types';

export interface MessageFilter {
  id: string;
  name: string;
  includesText: string[];
  excludesText: string[];
  includesAll: string[];
  includesMedia: boolean;
  excludesMedia: boolean;
  regexp?: string;
  callbackTopic?: string;
  matchGoal?: string;
  batchSizeCharacters: number;
  batchSizeMessages: number;
  createdAt: number;
  updatedAt: number;
}

export interface CreateFilterDto {
  name: string;
  includesText?: string[];
  excludesText?: string[];
  includesAll?: string[];
  includesMedia?: boolean;
  excludesMedia?: boolean;
  regexp?: string;
  callbackTopic?: string;
  matchGoal?: string;
  batchSizeCharacters?: number;
  batchSizeMessages?: number;
}

export interface UpdateFilterDto {
  name?: string;
  includesText?: string[];
  excludesText?: string[];
  includesAll?: string[];
  includesMedia?: boolean;
  excludesMedia?: boolean;
  regexp?: string;
  callbackTopic?: string;
  matchGoal?: string;
  batchSizeCharacters?: number;
  batchSizeMessages?: number;
}

export interface TestFilterRequest {
  messageText: string;
  hasMedia?: boolean;
}

export interface TestFilterResponse {
  filterId: string;
  filterName: string;
  messageText: string;
  hasMedia?: boolean;
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
    testFilter: builder.mutation<TestFilterResponse, { id: string; testData: TestFilterRequest }>({
      query: ({ id, testData }) => ({
        url: `/${id}/test`,
        method: 'POST',
        body: testData
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