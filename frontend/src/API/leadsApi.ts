// frontend/src/API/leadsApi.ts (обновленная версия для работы с реальной структурой данных)
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../config';

// Типизация соответствует реальной структуре данных с API
export interface Lead {
  id: string;
  _id: string;
  user: string;
  account?: {
    parsingEnabled: boolean;
    _id: string;
    id: string;
    name: string;
    sessionData: string;
    username?: string | null;
    firstname?: string | null;
    lastname?: string | null;
    user: string;
    phone: string;
    status: string;
    createdAt: number;
  };
  message?: {
    _id: string;
    sender: number;
    sourceType: string;
    generatedTags: string[];
    lang: string | null;
    accountString: string;
    user: string;
    messageMedia: any[];
    messageText: string;
    filtered: string[];
    filterNames: string[];
    aiProcessed: boolean;
    id: string;
    createdAt: number;
  };
  messageText: string;
  sender: number;
  senderUsername: string;
  chatTitle: string;
  chatType: string;
  sentAt: string;
  messageType: string;
  mainCategory: string;
  keywords: string[];
  lang: string;
  isScam: boolean;
  matchedFilter?: {
    includesAll: string[];
    includesMedia: boolean;
    excludesMedia: boolean;
    batchSizeCharacters: number;
    _id: string;
    user: string;
    includesText: string[];
    name: string;
    excludesText: string[];
    id: string;
    createdAt: number;
    batchSizeMessages: number;
    currentCharactersLength: number;
    currentMessagesLength: number;
  };
  confidence: number;
  createdAt: number;
}

export interface LeadsResponse {
  items: Lead[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export const leadsApi = createApi({
  reducerPath: 'leadsApi',
  tagTypes: ['leads', 'lead'],
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL + '/leads',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (typeof token === 'string') {
        headers.set('Authorization', token);
      }
      return headers;
    }
  }),
  endpoints: (builder) => ({
    // Get all leads for the current user
    getLeads: builder.query<Lead[], string>({
      query: (query) => ({
        url: query ? `/?${query}` : '/',
        method: 'GET'
      }),
      // Обрабатываем ответ API, который может быть в разных форматах
      transformResponse: (response: unknown): Lead[] => {
        console.log("API response:", response);

        // Если ответ - это массив Lead[]
        if (Array.isArray(response)) {
          return response;
        }

        // Если ответ в формате { items: Lead[] }
        if (response && typeof response === 'object' && 'items' in response) {
          const typedResponse = response as LeadsResponse;
          return typedResponse.items || [];
        }

        // Если ответ приходит в виде объекта Lead
        if (response && typeof response === 'object' && 'id' in response) {
          return [response as Lead];
        }

        // Проверяем другие возможные форматы
        if (response && typeof response === 'object') {
          const possibleArrayKeys = ['leads', 'data', 'results'];
          for (const key of possibleArrayKeys) {
            if (key in response && Array.isArray((response as any)[key])) {
              return (response as any)[key];
            }
          }
        }

        console.warn("Couldn't parse leads response:", response);
        return [];
      },
      providesTags: ['leads']
    }),

    // Get a single lead by ID
    getLead: builder.query<Lead, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'GET'
      }),
      providesTags: (_, __, id) => [{ type: 'lead', id }]
    }),

    // Остальные методы
    createLead: builder.mutation<Lead, Partial<Lead>>({
      query: (data) => ({
        url: '/',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['leads']
    }),

    updateLead: builder.mutation<Lead, Partial<Lead> & { id: string }>({
      query: ({ id, ...data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (_, __, { id }) => [
        'leads',
        { type: 'lead', id }
      ]
    }),

    deleteLead: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['leads']
    }),
  }),
});

export const {
  useGetLeadsQuery,
  useGetLeadQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useDeleteLeadMutation
} = leadsApi;