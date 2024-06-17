import React, { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import { api } from "../config/axiosConfig";
import logo from "../assets/logo.png";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [sex, setSex] = useState("other");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/user", {
        username,
        email,
        password,
        company,
        phone,
        sex,
      });
      if (response.status === 201) {
        navigate({ to: "/login" });
      }
    } catch (error) {
      setError(
        error.response.data.error || "An error occurred. Please try again.",
      );
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
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
          style={{ width: "150px", marginBottom: "20px" }}
        />
        <Typography component="h1" variant="h5">
          Register
        </Typography>
        <Box component="form" onSubmit={handleRegister} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="new-username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="new-email"
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            required
            name="company"
            label="Company"
            type="company"
            id="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            required
            name="phone"
            label="Phone"
            type="phone"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="sex-label">Sex</InputLabel>
            <Select
              labelId="sex-label"
              id="sex"
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              label="Sex"
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Register
          </Button>
        </Box>
      </Box>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>
          <DialogContentText>{error}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Register;
