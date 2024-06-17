import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  Button,
  Typography,
} from "@mui/material";
import { api } from "../config/axiosConfig";
import { useDialog } from "../services/DialogService";

const AddTask = () => {
  const { projectId } = useParams({ strict: false });
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    status: "todo",
    sprint_id: "",
    assigned_to: "",
    project_id: projectId,
  });
  const [users, setUsers] = useState([]);
  const [sprints, setSprints] = useState([]);
  const navigate = useNavigate();
  const { openInfoDialog } = useDialog();

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await api.get(`/project_member/${taskData.project_id}`);
      setUsers(response.data.members);
    };

    const fetchSprints = async () => {
      const response = await api.get(
        `/sprint/by_project/${taskData.project_id}`,
      );
      setSprints(response.data);
    };

    fetchUsers();
    fetchSprints();
  }, [taskData.project_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData({ ...taskData, [name]: value });
  };

  const handleSave = async () => {
    const taskPayload = {
      ...taskData,
      sprint_id: taskData.sprint_id || null,
      assigned_to: taskData.assigned_to || null,
    };

    try {
      await api.post("/task", taskPayload);
      navigate({ to: `/home/projects/${taskData.project_id}/tasks` });
    } catch (error) {
      openInfoDialog(error.response.data.error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Add Task
      </Typography>
      <TextField
        label="Title"
        name="title"
        value={taskData.title}
        onChange={handleChange}
        fullWidth
        sx={{ mb: 2 }}
        required
      />
      <TextField
        label="Description"
        name="description"
        value={taskData.description}
        onChange={handleChange}
        fullWidth
        multiline
        rows={4}
        sx={{ mb: 2 }}
        required
      />
      <Typography variant="h6" sx={{ mb: 1 }}>
        Status
      </Typography>
      <Select
        label="Status"
        name="status"
        value={taskData.status}
        onChange={handleChange}
        fullWidth
        sx={{ mb: 2 }}
      >
        <MenuItem value="todo">To Do</MenuItem>
        <MenuItem value="in progress">In Progress</MenuItem>
        <MenuItem value="done">Done</MenuItem>
      </Select>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Assignee
      </Typography>
      <Select
        label="Assignee"
        name="assigned_to"
        value={taskData.assigned_to}
        onChange={handleChange}
        fullWidth
        sx={{ mb: 2 }}
      >
        {Array.isArray(users) &&
          users.map((user) => (
            <MenuItem key={user.user_id} value={user.user_id}>
              {user.email}
            </MenuItem>
          ))}
      </Select>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Sprint
      </Typography>
      <Select
        label="Sprint"
        name="sprint_id"
        value={taskData.sprint_id}
        onChange={handleChange}
        fullWidth
        sx={{ mb: 2 }}
      >
        {Array.isArray(sprints) &&
          sprints.map((sprint) => (
            <MenuItem key={sprint.sprint_id} value={sprint.sprint_id}>
              {sprint.name}
            </MenuItem>
          ))}
      </Select>
      <Button variant="contained" color="primary" onClick={handleSave}>
        Save
      </Button>
    </Box>
  );
};

export default AddTask;
