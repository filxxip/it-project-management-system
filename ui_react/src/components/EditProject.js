import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { api } from "../config/axiosConfig";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useDialog } from "../services/DialogService";

const EditProject = () => {
  const { projectId } = useParams({ strict: false });
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [members, setMembers] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const { openInfoDialog } = useDialog();

  useEffect(() => {
    const fetchProject = async () => {
      const response = await api.get(`/project/${projectId}`);
      const project = response.data;
      setIsOwner(project.is_owner);
      setUserId(project.created_by);
      if (!project.is_owner) {
        openInfoDialog("You are not authorized to edit this project");
      } else {
        setName(project.name);
        setDescription(project.description);
      }
    };

    const fetchProjectMembers = async () => {
      const response = await api.get(`/project_member/${projectId}`);
      setMembers(response.data.members);
    };

    fetchProject();
    fetchProjectMembers();
  }, [projectId, openInfoDialog]);

  const handleEditProject = async () => {
    try {
      await api.put(`/project/${projectId}`, {
        name: name,
        description: description,
      });
      openInfoDialog("Project updated successfully");
    } catch (error) {
      openInfoDialog(error.response?.data?.error || "Failed to update project");
    }
  };

  const handleAddMember = async () => {
    try {
      const response = await api.post("/project_member", {
        email: email,
        project_id: projectId,
      });
      setMembers([
        ...members,
        { user_id: response.data.user_id, email: email },
      ]);
      openInfoDialog("User added to project successfully");
    } catch (error) {
      openInfoDialog(
        error.response?.data?.error || "Failed to add user to project",
      );
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await api.delete(`/project_member/${projectId}/${memberId}`);
      setMembers(members.filter((member) => member.user_id !== memberId));
      openInfoDialog("User removed from project successfully");
    } catch (error) {
      openInfoDialog(
        error.response?.data?.error || "Failed to remove user from project",
      );
    }
  };

  const handleDeleteProject = async () => {
    try {
      await api.delete(`/project/${projectId}`);
      openInfoDialog("Project deleted successfully");
      navigate({ to: "/home/projects" });
    } catch (error) {
      openInfoDialog(error.response?.data?.error || "Failed to delete project");
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
          Edit Project
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
          required
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
          onClick={handleEditProject}
        >
          Update Project
        </Button>
        <Button
          fullWidth
          variant="contained"
          color="error"
          sx={{ mt: 1, mb: 2 }}
          onClick={handleDeleteProject}
        >
          Delete Project
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: 4,
          padding: 4,
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <Typography component="h2" variant="h6">
          Add Member to Project
        </Typography>
        <TextField
          margin="normal"
          required
          fullWidth
          id="email"
          label="User Email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          onClick={handleAddMember}
        >
          Add Member
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: 4,
          padding: 4,
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <Typography component="h2" variant="h6">
          Project Members
        </Typography>
        <List>
          {members.map((member) => (
            <ListItem
              key={member.user_id}
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleRemoveMember(member.user_id)}
                  disabled={isOwner && member.user_id === userId}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText primary={member.email} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Container>
  );
};

export default EditProject;
