import { ReactNode, useEffect } from "react";
import { useTheme } from "../../../hooks/useTheme";


export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { theme } = useTheme();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return <>{children}</>;
};
