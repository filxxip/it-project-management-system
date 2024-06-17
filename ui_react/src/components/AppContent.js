import React, { useEffect, useState } from "react";
import { Outlet } from "@tanstack/react-router";
import { useLoading } from "../services/LoadingContext";
import LoadingOverlay from "../services/LoadingOverlay";
import { setupInterceptors } from "../config/axiosConfig";
import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const AppContent = () => {
  const { startLoading, stopLoading } = useLoading();
  const [error, setError] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    setupInterceptors(startLoading, stopLoading, setError);
  }, [startLoading, stopLoading]);

  return (
    <>
      <LoadingOverlay />
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: theme.palette.background.default,
        }}
      >
        {error ? (
          <Box
            sx={{
              textAlign: "center",
              backgroundColor:
                theme.palette.mode === "dark" ? "#263238" : "#e0f7fa",
              padding: "2rem",
              borderRadius: "10px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              maxWidth: "600px",
              width: "100%",
              margin: "auto",
              mt: 4,
            }}
          >
            <Typography
              variant="h1"
              sx={{
                margin: 0,
                fontSize: "2rem",
                color: theme.palette.mode === "dark" ? "#ffffff" : "#00796b",
              }}
            >
              Unauthorized Access
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: "1.2rem",
                color: theme.palette.mode === "dark" ? "#b0bec5" : "#004d40",
              }}
            >
              You do not have permission to view this content.
            </Typography>
          </Box>
        ) : (
          <Outlet />
        )}
      </Box>
    </>
  );
};

export default AppContent;
