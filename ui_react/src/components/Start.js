import React from "react";
import { Button, Container, Box } from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import logo from "../assets/logo.png";

const Home = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate({ to: "/login" });
  };

  const handleRegister = () => {
    navigate({ to: "/register" });
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
        <img
          src={logo}
          alt="Logo"
          style={{ width: "300px", marginBottom: "20px" }}
        />
        <Box sx={{ mt: 3 }}>
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 1, mb: 1 }}
            onClick={handleLogin}
          >
            Login
          </Button>
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 1, mb: 1 }}
            onClick={handleRegister}
          >
            Register
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Home;
