import React, { useState, useEffect } from "react";
import { useParams } from "@tanstack/react-router";
import {
  Box,
  Grid,
  Typography,
  Select,
  MenuItem,
  Button,
  Chip,
} from "@mui/material";
import { api } from "../config/axiosConfig";
import { useNavigate } from "@tanstack/react-router";

const ProjectDetail = () => {
  const { projectId } = useParams({ strict: false });
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [labels, setLabels] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [filter, setFilter] = useState({ label_id: "", sprint_id: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const tasksResponse = await api.get(`/task/by_project/${projectId}`);
        setTasks(tasksResponse.data);
        setFilteredTasks(tasksResponse.data);

        const labelsResponse = await api.get(`/label/by_project/${projectId}`);
        setLabels(labelsResponse.data);

        const sprintsResponse = await api.get(
          `/sprint/by_project/${projectId}`,
        );
        setSprints(sprintsResponse.data);
      } catch (error) {
        console.error("Failed to fetch project data", error);
      }
    };

    fetchProjectData();
  }, [projectId]);

  useEffect(() => {
    const fetchFilteredTasks = async () => {
      try {
        const { label_id, sprint_id } = filter;
        let url = `/task/by_project/${projectId}`;
        if (label_id && !sprint_id) url += `?label_id=${label_id}`;
        if (!label_id && sprint_id) url += `?sprint_id=${sprint_id}`;
        if (label_id && sprint_id)
          url += `?label_id=${label_id}&sprint_id=${sprint_id}`;
        const response = await api.get(url);
        console.log(response.data);
        setFilteredTasks(response.data);
      } catch (error) {
        console.error("Failed to fetch filtered tasks", error);
      }
    };

    if (filter.label_id || filter.sprint_id) {
      fetchFilteredTasks();
    } else {
      setFilteredTasks(tasks);
    }
  }, [filter, tasks, projectId]);

  const handleFilterChange = (event) => {
    setFilter({ ...filter, [event.target.name]: event.target.value });
  };

  const renderTaskList = (status, statusName) => (
    <Box
      sx={{
        flex: 1,
        p: 2,
        bgcolor: "background.paper",
        borderRadius: 1,
        boxShadow: 1,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
        {status}
      </Typography>
      {filteredTasks
        .filter((task) => task.status === statusName)
        .map((task) => (
          <Box
            key={task.task_id}
            sx={{
              mb: 2,
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
            }}
          >
            <Typography
              variant="body1"
              sx={{ fontWeight: "bold", textAlign: "center", mb: 2 }}
            >
              {task.title}
            </Typography>
            <Box
              sx={{
                position: "absolute",
                right: 16,
                top: 16,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
              }}
            >
              {task.label_names &&
                task.label_names.map((label) => (
                  <Chip key={label} label={label} sx={{ mb: 1 }} />
                ))}
            </Box>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              sx={{ mt: "auto", alignSelf: "center" }}
              onClick={() => handleOpenTask(task.task_id)}
            >
              Open Task
            </Button>
          </Box>
        ))}
    </Box>
  );

  const handleOpenTask = (taskId) => {
    navigate({ to: `/home/projects/${projectId}/tasks/${taskId}` });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Project Tasks
      </Typography>
      <Box sx={{ mb: 3, display: "flex" }}>
        <Select
          name="label_id"
          value={filter.label_id}
          onChange={handleFilterChange}
          displayEmpty
          sx={{ mr: 2 }}
        >
          <MenuItem value="">All Labels</MenuItem>
          {labels.map((label) => (
            <MenuItem key={label.label_id} value={label.label_id}>
              {label.name}
            </MenuItem>
          ))}
        </Select>
        <Select
          name="sprint_id"
          value={filter.sprint_id}
          onChange={handleFilterChange}
          displayEmpty
        >
          <MenuItem value="">All Sprints</MenuItem>
          {sprints.map((sprint) => (
            <MenuItem key={sprint.sprint_id} value={sprint.sprint_id}>
              {sprint.name}
            </MenuItem>
          ))}
        </Select>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          {renderTaskList("TO-DO", "todo")}
        </Grid>
        <Grid item xs={12} md={4}>
          {renderTaskList("WORK-IN-PROGRESS", "in progress")}
        </Grid>
        <Grid item xs={12} md={4}>
          {renderTaskList("DONE", "done")}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProjectDetail;
