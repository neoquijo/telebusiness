// frontend/src/core/store/slices/accountSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Account, AccountInfo } from '../../../types/Account';
import { NormalizedDialog } from '../../../modules/AccountsModule/types';

export interface AccountState {
  // Форма добавления аккаунта
  phone: string;
  accountName: string;
  use2fa: boolean;
  code: string;
  phoneCodeHash: string;
  password: string;
  session: string;
  accountInfo: AccountInfo | undefined;

  // Данные для работы с аккаунтами
  dialogs: NormalizedDialog[];
  currentAccount: Account | undefined;

  // Форма редактирования аккаунта
  editMode: boolean;
  editId: string | null;
}

const initialState: AccountState = {
  // Форма добавления аккаунта
  phone: '',
  code: '',
  accountName: '',
  use2fa: false,
  phoneCodeHash: '',
  password: '',
  session: '',
  accountInfo: undefined,

  // Данные для работы с аккаунтами
  dialogs: [],
  currentAccount: undefined,

  // Форма редактирования аккаунта
  editMode: false,
  editId: null
};

export const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    // Общие редьюсеры для форм
    setPhone: (state, { payload }: PayloadAction<string>) => {
      state.phone = payload;
    },
    setCode: (state, { payload }: PayloadAction<string>) => {
      state.code = payload;
    },
    setPassword: (state, { payload }: PayloadAction<string>) => {
      state.password = payload;
    },
    setUse2Fa: (state, { payload }: PayloadAction<boolean>) => {
      state.use2fa = payload;
    },
    setHash: (state, { payload }: PayloadAction<string>) => {
      state.phoneCodeHash = payload;
    },
    setAccountName: (state, { payload }: PayloadAction<string>) => {
      state.accountName = payload;
    },
    setSessionString: (state, { payload }: PayloadAction<string>) => {
      state.session = payload;
    },
    setAccountInfo: (state, { payload }: PayloadAction<AccountInfo>) => {
      state.accountInfo = payload;
    },

    // Работа с аккаунтами
    setDialogs: (state, { payload }: PayloadAction<NormalizedDialog[]>) => {
      state.dialogs = payload;
    },
    setCurrentAccount: (state, { payload }: PayloadAction<Account>) => {
      state.currentAccount = payload;
    },

    // Редактирование аккаунта
    startEditAccount: (state, { payload }: PayloadAction<Account>) => {
      state.editMode = true;
      state.editId = payload.id;
      state.accountName = payload.name;
      state.phone = payload.phone;
      // Другие поля, которые можно редактировать
    },

    cancelEdit: (state) => {
      state.editMode = false;
      state.editId = null;
      state.accountName = '';
      state.phone = '';
    },

    // Сброс формы
    resetAccountForm: (state) => {
      state.phone = '';
      state.code = '';
      state.accountName = '';
      state.use2fa = false;
      state.phoneCodeHash = '';
      state.password = '';
      state.session = '';
      state.accountInfo = undefined;
      state.editMode = false;
      state.editId = null;
    }
  },
});

export const {
  setCurrentAccount,
  setCode,
  setPhone,
  setHash,
  setPassword,
  setUse2Fa,
  setAccountName,
  setSessionString,
  setAccountInfo,
  setDialogs,
  startEditAccount,
  cancelEdit,
  resetAccountForm
} = accountSlice.actions;

export const accountReducer = accountSlice.reducer;
export default accountReducer;