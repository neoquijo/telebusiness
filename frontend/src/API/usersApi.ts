import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../config';


export const usersApi = createApi({
  reducerPath: 'usersApi',
  tagTypes: ['userList'],

  baseQuery: fetchBaseQuery({
    baseUrl: API_URL + '/admin/users',
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
      invalidatesTags: ['userList']
    }),

    getAllUsers: builder.query({
      providesTags: ['userList'],
      query: (query) => ({
        url: query ? '/' + query : '/',
        method: 'GET'
      })
    }),

    createUser: builder.mutation({
      invalidatesTags: ['userList'],
      query: data => ({
        url: '/create',
        method: 'POST',
        body: data
      })
    }),
  }),
});

export const {
  useCreateUserMutation,
  useDeleteUserMutation,

  useGetAllUsersQuery,
} = usersApi;
