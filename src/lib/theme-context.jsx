import { useTheme as useNextTheme } from "next-themes";
import { ThemeProvider as AppThemeProvider } from "@/components/theme-provider";

export const ThemeProvider = AppThemeProvider;
export const useTheme = useNextTheme;
export default ThemeProvider;
