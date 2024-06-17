import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Typography,
  Checkbox,
  FormControl,
  Select,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import { useDialog } from "../services/DialogService";
import { api } from "../config/axiosConfig";

const EditTask = () => {
  const { taskId } = useParams({ strict: false });
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    status: "todo",
    sprint_id: "",
    assigned_to: "",
    project_id: "",
    labels: [],
  });
  const [users, setUsers] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [allLabels, setAllLabels] = useState([]);
  const navigate = useNavigate();
  const { openInfoDialog } = useDialog();

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const response = await api.get(`/task/details/${taskId}`);
        const { task, users, sprints, project_labels } = response.data;

        setTaskData({
          ...task,
          sprint_id: task.sprint_id || "",
          assigned_to: task.assigned_to || "",
          labels: task.labels || [],
        });

        setUsers(users);
        setSprints(sprints);
        setAllLabels(project_labels);
      } catch (error) {
        console.error("Failed to fetch task details", error);
      }
    };

    fetchTaskDetails();
  }, [taskId]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get(`/project_member/${taskData.project_id}`);
        setUsers(response.data.members);
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    };

    const fetchSprints = async () => {
      try {
        const response = await api.get(`/sprint/by_project/${taskData.project_id}`);
        setSprints(response.data);
      } catch (error) {
        console.error("Failed to fetch sprints", error);
      }
    };

    if (taskData.project_id) {
      fetchUsers();
      fetchSprints();
    }
  }, [taskData.project_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData({ ...taskData, [name]: value });
  };

  const handleLabelChange = (label) => {
    setTaskData((prevTaskData) => {
      const newLabels = prevTaskData.labels.some(
        (selectedLabel) => selectedLabel.label_id === label.label_id
      )
        ? prevTaskData.labels.filter(
            (selectedLabel) => selectedLabel.label_id !== label.label_id
          )
        : [...prevTaskData.labels, label];
      return { ...prevTaskData, labels: newLabels };
    });
  };

  const handleSave = async () => {
    const taskPayload = {
      ...taskData,
      sprint_id: taskData.sprint_id || null,
      assigned_to: taskData.assigned_to || null,
      labels: taskData.labels.map((label) => ({ label_id: label.label_id })),
    };

    try {
      console.log(taskPayload);
      await api.put(`/task/${taskId}`, taskPayload);
      navigate({ to: `/home/projects/${taskData.project_id}/tasks` });
    } catch (error) {
      openInfoDialog(error.response.data.error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Task Details
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
        value={taskData.sprint_id || ""}
        onChange={handleChange}
        fullWidth
        sx={{ mb: 2 }}
      >
        <MenuItem value="">None</MenuItem>
        {Array.isArray(sprints) &&
          sprints.map((sprint) => (
            <MenuItem key={sprint.sprint_id} value={sprint.sprint_id}>
              {sprint.name}
            </MenuItem>
          ))}
      </Select>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Labels
      </Typography>
      <Box sx={{ maxHeight: 200, overflow: "auto" }}>
        <FormControl component="fieldset">
          <FormGroup>
            {Array.isArray(allLabels) &&
              allLabels.map((label) => (
                <FormControlLabel
                  key={label.label_id}
                  control={
                    <Checkbox
                      checked={taskData.labels.some(
                        (selectedLabel) =>
                          selectedLabel.label_id === label.label_id
                      )}
                      onChange={() => handleLabelChange(label)}
                    />
                  }
                  label={label.name}
                />
              ))}
          </FormGroup>
        </FormControl>
      </Box>
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
        onClick={handleSave}
      >
        Save
      </Button>
    </Box>
  );
};

export default EditTask;
