import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { api } from "../config/axiosConfig";

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get("/setting");
        const settings = response.data;
        setDarkMode(settings.theme_mode === "dark");
      } catch (error) {
        console.error("Failed to fetch theme settings:", error);
      }
    };

    fetchSettings();
  }, []);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    api
      .put("/setting", { theme_mode: !darkMode ? "dark" : "light" })
      .catch((error) => {
        console.error("Failed to update theme settings:", error);
      });
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
