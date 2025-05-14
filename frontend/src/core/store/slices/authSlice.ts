import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../../types/User';

export interface AuthState {
  token: string | null;
  isAuth: boolean;
  user?: User;
}

const initialState: AuthState = {
  token: null,
  isAuth: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, { payload }: PayloadAction<boolean>) => {
      state.isAuth = payload;
    },
    setUser: (state, { payload }: PayloadAction<User | undefined>) => {
      state.user = payload;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    clearToken: (state) => {
      state.token = null;
    },
    logOut: (state) => {
      state.user = undefined;
      state.isAuth = false;
      window.location.reload()
    }
  },
});

export const { setToken, clearToken, setAuth, setUser } = authSlice.actions;
export const authReducer = authSlice.reducer;
export default authReducer;
