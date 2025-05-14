import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { NormalizedDialog } from "../../../modules/AccountsModule/types";

interface InitialState {
  nowImporting: boolean;
  importingChatIds: Array<number>;
  importingChats: Array<NormalizedDialog>;
  filterType: 'private' | 'bot' | 'channel' | 'chat' | 'selected' | null;
  searchQuery: string;
}

const initialState: InitialState = {
  nowImporting: false,
  importingChatIds: [],
  importingChats: [],
  filterType: null,
  searchQuery: ''
}

export const dialogSlice = createSlice({
  reducerPath: 'dialogs',
  initialState,
  name: "dialogs",
  reducers: {
    setImportingChats: (state, { payload }) => {
      state.nowImporting = payload;
    },
    setChatImportIds: (state, { payload }) => {
      state.importingChatIds = payload;
    },
    addChatImportId: (state, { payload }: { payload: number }) => {
      if (!state.importingChatIds.includes(payload)) {
        state.importingChatIds.push(payload);
      }
    },
    deleteChatImportId: (state, { payload }) => {
      state.importingChatIds = state.importingChatIds.filter(id => id !== payload);
    },
    resetChatImports: (state) => {
      state.importingChatIds = [];
      state.importingChats = [];
    },
    addMultipleChatImports: (state, action: PayloadAction<number[]>) => {
      const newIds = action.payload.filter(id => !state.importingChatIds.includes(id));
      state.importingChatIds = [...state.importingChatIds, ...newIds];
    },
    setFilterType: (state, action: PayloadAction<'private' | 'bot' | 'channel' | 'chat' | 'selected' | null>) => {
      state.filterType = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    addFilteredDialogsToImport: (state, action: PayloadAction<NormalizedDialog[]>) => {
      const filteredIds = action.payload.map(dialog => dialog.id);
      const newIds = filteredIds.filter(id => !state.importingChatIds.includes(id));
      state.importingChatIds = [...state.importingChatIds, ...newIds];
    }
  }
});

export const {
  setImportingChats,
  setChatImportIds,
  addChatImportId,
  deleteChatImportId,
  resetChatImports,
  addMultipleChatImports,
  setFilterType,
  setSearchQuery,
  addFilteredDialogsToImport
} = dialogSlice.actions;

export default dialogSlice.reducer;