import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Theme = 'light' | 'dark';



const storage = {
  getItem: (key: string) => localStorage.getItem(key),
  setItem: (key: string, value: string) => localStorage.setItem(key, value),
};

const getInitialTheme = (): Theme => {
  const savedTheme = storage.getItem('theme') as Theme;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  if (!savedTheme) {
    storage.setItem('theme', initialTheme);
  }

  return initialTheme;
};

const initialState = {
  theme: getInitialTheme(),
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
      storage.setItem('theme', action.payload);
    },
    toggleTheme(state) {

      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      state.theme = newTheme;
      storage.setItem('theme', newTheme);
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export const themeReducer = themeSlice.reducer;
export default themeReducer;
