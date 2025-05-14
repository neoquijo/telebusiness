import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { authApi } from '../../API/authApi';
import { authSlice } from './slices/authSlice';
import { themeSlice } from './slices/themeSlice';
import { rtkQueryErrorLogger } from '../../API/errorHandlerMiddleware';
import { isLoadingMiddleware } from '../../API/isLoadingMiddleware';
import { usersApi } from '../../API/usersApi';
import { canvasSlice } from './slices/canvasSlice';
import { accountsApi } from '../../API/accountsApi';
import { accountSlice } from './slices/accountSlice';
import { dialogSlice } from './slices/dialogSlice';
import { chatsApi } from '../../API/chatsApi';
// import { apiListenerMiddleware } from '../../API/middlewares/apiListenerMiddleware';


export const mainStore = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [accountsApi.reducerPath]: accountsApi.reducer,
    [chatsApi.reducerPath]: chatsApi.reducer,
    account: accountSlice.reducer,
    auth: authSlice.reducer,
    canvas: canvasSlice.reducer,
    theme: themeSlice.reducer,
    dialogs: dialogSlice.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(isLoadingMiddleware)
      .concat(rtkQueryErrorLogger)
      .concat(accountsApi.middleware)
      .concat(authApi.middleware)
      .concat(chatsApi.middleware)
  // .concat(apiListenerMiddleware.middleware)
});

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
export const useAppDispatch: () => AppDispatch = useDispatch
export type RootState = ReturnType<typeof mainStore.getState>;
export type AppDispatch = typeof mainStore.dispatch;
