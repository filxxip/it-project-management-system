import React, { useState } from "react";
import { Container, TextField, Button, Typography, Box } from "@mui/material";
import { api } from "../config/axiosConfig";
import { useNavigate } from "@tanstack/react-router";
import { useDialog } from "../services/DialogService";

const AddProject = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { openInfoDialog } = useDialog();
  const navigate = useNavigate();

  const handleAddProject = async () => {
    try {
      await api.post("/project", {
        name: name,
        description: description,
      });
      openInfoDialog("Project added successfully");
    } catch (error) {
      openInfoDialog(error.response.data.error);
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
        <Typography component="h1" variant="h5">
          Add New Project
        </Typography>
        <TextField
          margin="normal"
          required
          fullWidth
          id="name"
          label="Project Name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          margin="normal"
          fullWidth
          id="description"
          label="Project Description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          onClick={handleAddProject}
        >
          Add Project
        </Button>
      </Box>
    </Container>
  );
};

export default AddProject;
