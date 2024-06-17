import React, { useState, useEffect } from "react";
import { useParams } from "@tanstack/react-router";
import {
  Box,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { api } from "../config/axiosConfig";
import { useDialog } from "../services/DialogService";

const Sprints = () => {
  const { projectId } = useParams({ strict: false });
  const [sprints, setSprints] = useState([]);
  const [newSprint, setNewSprint] = useState({
    name: "",
    start_date: "",
    end_date: "",
  });
  const { openInfoDialog } = useDialog();

  useEffect(() => {
    const fetchSprints = async () => {
      const response = await api.get(`/sprint/by_project/${projectId}`);
      setSprints(response.data);
    };

    fetchSprints();
  }, [projectId]);

  const handleAddSprint = async () => {
    const sanitizedSprint = {
      ...newSprint,
      project_id: projectId,
      start_date: newSprint.start_date || null,
      end_date: newSprint.end_date || null,
    };

    try {
      const response = await api.post("/sprint", sanitizedSprint);
      setSprints([
        ...sprints,
        { ...sanitizedSprint, sprint_id: response.data.sprint_id },
      ]);
      setNewSprint({ name: "", start_date: "", end_date: "" });
    } catch (error) {
      openInfoDialog(error.response.data.error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewSprint({ ...newSprint, [name]: value });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Project Sprints
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sprints.map((sprint) => (
              <TableRow key={sprint.sprint_id}>
                <TableCell>{sprint.name}</TableCell>
                <TableCell>{sprint.start_date}</TableCell>
                <TableCell>{sprint.end_date}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell>
                <TextField
                  label="Sprint Name"
                  name="name"
                  value={newSprint.name}
                  onChange={handleChange}
                  fullWidth
                />
              </TableCell>
              <TableCell>
                <TextField
                  label="Start Date"
                  name="start_date"
                  type="date"
                  value={newSprint.start_date}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </TableCell>
              <TableCell>
                <TextField
                  label="End Date"
                  name="end_date"
                  type="date"
                  value={newSprint.end_date}
                  onChange={handleChange}
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddSprint}
                >
                  Add Sprint
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Sprints;
