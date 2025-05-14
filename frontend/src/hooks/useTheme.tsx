import { useSelector } from "react-redux";
import { AppDispatch, RootState, useAppDispatch } from "../core/store/MainStore";
import { setTheme, Theme, toggleTheme } from "../core/store/slices/themeSlice";

export const useTheme = () => {
  const dispatch: AppDispatch = useAppDispatch();
  const theme = useSelector((state: RootState) => state.theme.theme);

  const switchTheme = (newTheme: Theme) => dispatch(setTheme(newTheme));
  const toggle = () => dispatch(toggleTheme());

  return { theme, switchTheme, toggle };
};
