import { createSlice } from '@reduxjs/toolkit';
import { Account, AccountInfo } from '../../../types/Account';
import { NormalizedDialog } from '../../../modules/AccountsModule/types';

export interface AuthState {
  phone: string;
  accountName: string;
  use2fa: boolean;
  code: string;
  phoneCodeHash: string;
  password: string;
  session: string;
  accountInfo: AccountInfo | undefined;
  dialogs: NormalizedDialog[];
  currentAccount: Account | undefined
}

const initialState: AuthState = {
  phone: '',
  code: '',
  accountName: '',
  use2fa: false,
  phoneCodeHash: '',
  password: '',
  session: '',
  accountInfo: undefined,
  dialogs: [],
  currentAccount: undefined
};

export const accountSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setPhone: (state, { payload }) => {
      state.phone = payload
    },
    setCode: (state, { payload }) => {
      state.code = payload
    },
    setPassword: (state, { payload }) => {
      state.password = payload
    },
    setUse2Fa: (state, { payload }) => {
      state.use2fa = payload
    },
    setHash: (state, { payload }) => {
      state.phoneCodeHash = payload
    },
    setAccountName: (state, { payload }) => {
      state.accountName = payload
    },
    setSessionString: (state, { payload }) => {
      state.session = payload;
    },
    setAccountInfo: (state, { payload }) => {
      state.accountInfo = payload
    },
    setDialogs: (state, { payload }) => {
      state.dialogs = payload
    },
    setCurrentAccount: (state, { payload }) => {
      state.currentAccount = payload
    }
  },
});

export const { setCurrentAccount, setCode, setPhone, setHash, setPassword, setUse2Fa, setAccountName, setSessionString, setAccountInfo, setDialogs } = accountSlice.actions;
export const authReducer = accountSlice.reducer;
export default authReducer;
