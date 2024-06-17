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

const Labels = () => {
  const { projectId } = useParams({ strict: false });
  const [labels, setLabels] = useState([]);
  const [newLabel, setNewLabel] = useState("");
  const { openInfoDialog } = useDialog();

  useEffect(() => {
    const fetchLabels = async () => {
      const response = await api.get(`/label/by_project/${projectId}`);
      setLabels(response.data);
    };

    fetchLabels();
  }, [projectId]);

  const handleAddLabel = async () => {
    try {
      const response = await api.post("/label", {
        name: newLabel,
        project_id: projectId,
      });
      setLabels([
        ...labels,
        {
          label_id: response.data.label_id,
          name: newLabel,
          project_id: projectId,
        },
      ]);
      setNewLabel("");
    } catch (error) {
      openInfoDialog(error.response.data.error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Project Labels
      </Typography>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {labels.map((label) => (
              <TableRow key={label.label_id}>
                <TableCell>{label.name}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell>
                <TextField
                  label="Label Name"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  fullWidth
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddLabel}
                >
                  Add Label
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Labels;
