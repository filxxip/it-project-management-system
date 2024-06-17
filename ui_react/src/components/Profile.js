import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { api } from "../config/axiosConfig";
import { useNavigate } from "@tanstack/react-router";
import { useDialog } from "../services/DialogService";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();
  const { openInfoDialog, openConfirmDialog } = useDialog();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/user");
        setUser(response.data);
      } catch (error) {
        openInfoDialog("Failed to load user data.");
      }
    };

    fetchUser();
  }, [openInfoDialog]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleSave = async () => {
    const data = { ...user, newPassword: newPassword || undefined };
    try {
      await api.put("/user", data);
      openInfoDialog("Profile updated successfully");
    } catch (error) {
      openInfoDialog(
        error.response?.data?.error || "Failed to update profile!",
      );
    }
  };

  const handleDeleteClick = () => {
    openConfirmDialog(
      "Are you sure you want to delete your account? This action cannot be undone.",
      handleDeleteConfirm,
    );
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/user/${user.email}`);
      await api.post("/logout");
      navigate({ to: "/start" });
    } catch (error) {
      console.error("Failed to delete account:", error);
      openInfoDialog("Failed to delete account. Please try again.");
    }
  };

  if (!user) {
    return null;
  }

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
          ml: -5,
        }}
      >
        <Typography component="h1" variant="h5">
          Profile
        </Typography>
        <TextField
          margin="normal"
          required
          fullWidth
          id="username"
          label="Username"
          name="username"
          value={user.username}
          onChange={handleInputChange}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          value={user.email}
          disabled
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="password"
          label="Password"
          name="password_hash"
          type="password"
          value="******"
          disabled
        />
        <TextField
          margin="normal"
          fullWidth
          id="newPassword"
          label="New Password"
          name="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="company"
          label="Company"
          name="company"
          value={user.company}
          onChange={handleInputChange}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          id="phone"
          label="Phone"
          name="phone"
          value={user.phone}
          onChange={handleInputChange}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel id="sex-label">Sex</InputLabel>
          <Select
            labelId="sex-label"
            id="sex"
            name="sex"
            value={user.sex}
            onChange={handleInputChange}
          >
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </FormControl>
        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          onClick={handleSave}
        >
          Save
        </Button>
        <Button
          fullWidth
          variant="contained"
          color="error"
          onClick={handleDeleteClick}
        >
          Delete Account
        </Button>
      </Box>
    </Container>
  );
};

export default Profile;
