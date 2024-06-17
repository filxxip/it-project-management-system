import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Container,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { api } from "../config/axiosConfig";
import { useNavigate } from "@tanstack/react-router";
import { useDialog } from "../services/DialogService";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const { openConfirmDialog } = useDialog();

  useEffect(() => {
    const fetchProjects = async () => {
      const response = await api.get("/project/mine");
      setProjects(response.data);
    };

    fetchProjects();
  }, []);

  const handleAddProject = () => {
    navigate({ to: "/home/add_project" });
  };

  const handleEditProject = (projectId) => {
    navigate({ to: `/home/edit_project/${projectId}` });
  };

  const handleDelete = async (projectId) => {
    await api.delete(`/project_member/${projectId}`);
    setProjects(projects.filter((project) => project.project_id !== projectId));
  };

  const delMember = (projectId) => {
    openConfirmDialog("Are you sure to delete this project membership?", () => {
      handleDelete(projectId);
    });
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Projects
      </Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleAddProject}
        sx={{ marginBottom: 2 }}
      >
        Add Project
      </Button>
      <List>
        {projects.map((project) => (
          <ListItem key={project.project_id}>
            <ListItemText
              primary={project.name}
              secondary={project.description}
            />
            <ListItemSecondaryAction>
              {project.is_owner ? (
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={() => handleEditProject(project.project_id)}
                >
                  <EditIcon />
                </IconButton>
              ) : (
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => delMember(project.project_id)}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default Projects;
