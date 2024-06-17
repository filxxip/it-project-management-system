import React, { useEffect, useState } from "react";
import { Navigate } from "@tanstack/react-router";
import { api } from "../config/axiosConfig";
import { Box, CircularProgress } from "@mui/material";

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await api.get("/user", { withCredentials: true });
        setIsAuthenticated(!!response.data.username);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    checkAuthentication();
  }, []);

  return isAuthenticated;
};

const AuthRoute = ({ children, redirectTo, checkAuth }) => {
  const isAuthenticated = useAuth();

  if (isAuthenticated === null) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (checkAuth(isAuthenticated)) {
    return children;
  }

  return <Navigate to={redirectTo} />;
};

export default AuthRoute;
