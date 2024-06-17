import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Slider,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useTheme } from "../services/ThemeContext";
import { useIdleTimer } from "../services/IdleTimerContext";
import { api } from "../config/axiosConfig";

const Settings = () => {
  const { darkMode, toggleTheme } = useTheme();
  const { isEnabled, toggleIdleTimer, resetTimer } = useIdleTimer();
  const [autoLogoffTime, setAutoLogoffTime] = useState(30); // Default value in minutes

  useEffect(() => {
    const fetchSettings = async () => {
      const response = await api.get("/setting");
      const settings = response.data;
      setAutoLogoffTime(settings.auto_logoff_time);
      if (settings.theme_mode === "dark" && !darkMode) {
        toggleTheme();
      } else if (settings.theme_mode === "light" && darkMode) {
        toggleTheme();
      }
      if (settings.auto_logoff_enabled && !isEnabled) {
        toggleIdleTimer();
      } else if (!settings.auto_logoff_enabled && isEnabled) {
        toggleIdleTimer();
      }
    };

    fetchSettings();
  }, []);

  const updateSettings = async (newSettings) => {
    await api.put("/setting", newSettings);
  };

  const handleThemeChange = (newTheme) => {
    const themeMode = newTheme ? "dark" : "light";
    toggleTheme();
    updateSettings({ theme_mode: themeMode });
  };

  const handleIdleTimerChange = () => {
    const newIdleTimerStatus = !isEnabled;
    toggleIdleTimer();
    const newTimeInMs = autoLogoffTime * 60 * 1000;
    resetTimer(newTimeInMs);
    updateSettings({ auto_logoff_enabled: newIdleTimerStatus });
  };

  const handleAutoLogoffTimeChange = (event, newTime) => {
    setAutoLogoffTime(newTime);
  };

  const handleAutoLogoffTimeChangeCommitted = () => {
    const newTimeInMs = autoLogoffTime * 60 * 1000;
    resetTimer(newTimeInMs);
    updateSettings({ auto_logoff_time: autoLogoffTime });
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: 8,
          padding: 4,
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <Typography component="h1" variant="h5">
          Settings
        </Typography>
        <Box sx={{ display: "flex", gap: 2, marginTop: 2 }}>
          <Button
            variant={!darkMode ? "contained" : "outlined"}
            color="primary"
            onClick={() => handleThemeChange(false)}
          >
            Light Mode
          </Button>
          <Button
            variant={darkMode ? "contained" : "outlined"}
            color="primary"
            onClick={() => handleThemeChange(true)}
          >
            Dark Mode
          </Button>
        </Box>
        <Box sx={{ display: "flex", gap: 2, marginTop: 4 }}>
          <FormControlLabel
            control={
              <Switch
                checked={isEnabled}
                onChange={handleIdleTimerChange}
                color="primary"
              />
            }
            label="Auto Logoff"
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            marginTop: 4,
            width: "100%",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography gutterBottom>Auto Logoff Time (minutes)</Typography>
          <Slider
            value={autoLogoffTime}
            onChange={handleAutoLogoffTimeChange}
            onChangeCommitted={handleAutoLogoffTimeChangeCommitted}
            aria-labelledby="auto-logoff-slider"
            valueLabelDisplay="auto"
            step={1}
            marks
            min={1}
            max={120}
            sx={{ width: "80%" }}
          />
        </Box>
      </Box>
    </Container>
  );
};

export default Settings;
