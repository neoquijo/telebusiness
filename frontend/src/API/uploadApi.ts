import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../config';
import { Upload } from '../types/uploads';


export const uploadApi = createApi({
  reducerPath: 'uploadApi',
  tagTypes: ['uploads'],

  baseQuery: fetchBaseQuery({
    baseUrl: API_URL + '/uploads',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token')
      if (typeof token == 'string') {
        headers.set('Authorization', token)
      }
    }
  }),
  endpoints: (builder) => ({
    uploadImage: builder.mutation<Upload[], FormData>({
      query: (data: FormData) => ({
        url: '/image',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['uploads']
    }),
  }),
});

export const {
  useUploadImageMutation
} = uploadApi;
