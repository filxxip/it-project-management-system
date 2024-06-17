import React, { useState } from "react";
import { TextField, Button, Container, Typography, Box } from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import { api } from "../config/axiosConfig";
import logo from "../assets/logo.png";
import { useDialog } from "../services/DialogService";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { openInfoDialog } = useDialog();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
        console.log('API URL:', process.env.REACT_APP_API_URL);
      await api.post("/user/login", {
        log_data: email,
        password: password,
      });
      navigate({ to: "/home" });
    } catch (error) {
      openInfoDialog(error.response.data.error || "Invalid login credentials");
    }
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
        <Typography component="h1" variant="h5">
          Login
        </Typography>
        <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email or Login"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Login
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
