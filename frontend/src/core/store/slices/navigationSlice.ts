import { createSlice } from "@reduxjs/toolkit";


const initialState = {
  isLoading: false
};

export const navigationSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setIsLoading(state, { payload }) {
      state.isLoading = payload
    },
  },
});

export const { setIsLoading } = navigationSlice.actions;
