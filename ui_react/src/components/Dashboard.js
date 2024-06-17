import React, { useState, useEffect } from "react";
import { Outlet, Link, useNavigate } from "@tanstack/react-router";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  AppBar,
  Typography,
  Collapse,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { api } from "../config/axiosConfig";
import { useDialog } from "../services/DialogService";
import TimerIcon from "@mui/icons-material/Timer";
import { useIdleTimer } from "../services/IdleTimerContext";
import { useTheme } from "../services/ThemeContext";

const drawerWidth = 240;

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [projectListOpen, setProjectListOpen] = useState(false);
  const [openProjects, setOpenProjects] = useState({});
  const navigate = useNavigate();
  const { openConfirmDialog } = useDialog();
  const { timeLeft } = useIdleTimer();
  const { darkMode, toggleTheme } = useTheme();

  const fetchProjects = async () => {
    const response = await api.get("/project/mine");
    setProjects(response.data);
  };

  useEffect(() => {
    fetchProjects();

    const fetchSettings = async () => {
      const response = await api.get("/setting");
      const settings = response.data;

      if (settings.theme_mode === "dark" && !darkMode) {
        toggleTheme();
      } else if (settings.theme_mode === "light" && darkMode) {
        toggleTheme();
      }
    };

    fetchSettings();
  }, []);

  const handleLogoutClick = () => {
    openConfirmDialog("Are you sure you want to log out?", handleLogoutConfirm);
  };

  const handleLogoutConfirm = async () => {
    await api.post("/user/logout");
    navigate({ to: "/start" });
  };

  const handleProjectListClick = async () => {
    await fetchProjects();
    setProjectListOpen(!projectListOpen);
  };

  const handleProjectClick = (projectId) => {
    setOpenProjects((prevOpenProjects) => ({
      ...prevOpenProjects,
      [projectId]: !prevOpenProjects[projectId],
    }));
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Dashboard
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
            <TimerIcon />
            <Typography variant="body1" sx={{ ml: 1 }}>
              {formatTime(timeLeft)}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Box
          sx={{
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <List sx={{ flexGrow: 1 }}>
            <ListItem button component={Link} to="projects">
              <ListItemText primary="Projects" />
            </ListItem>
            <ListItem button onClick={handleProjectListClick}>
              <ListItemText primary="Manage Projects" />
              {projectListOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={projectListOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {projects.map((project) => (
                  <React.Fragment key={project.project_id}>
                    <ListItem
                      button
                      onClick={() => handleProjectClick(project.project_id)}
                      sx={{ pl: 4 }}
                    >
                      <ListItemText primary={project.name} />
                      {openProjects[project.project_id] ? (
                        <ExpandLess />
                      ) : (
                        <ExpandMore />
                      )}
                    </ListItem>
                    <Collapse
                      in={openProjects[project.project_id]}
                      timeout="auto"
                      unmountOnExit
                    >
                      <List component="div" disablePadding>
                        <ListItem
                          button
                          component={Link}
                          to={`/home/projects/${project.project_id}/addtask`}
                          sx={{ pl: 8 }}
                        >
                          <ListItemText primary="Add Task" />
                        </ListItem>
                        <ListItem
                          button
                          component={Link}
                          to={`/home/projects/${project.project_id}/tasks`}
                          sx={{ pl: 8 }}
                        >
                          <ListItemText primary="Tasks" />
                        </ListItem>
                        <ListItem
                          button
                          component={Link}
                          to={`/home/projects/${project.project_id}/labels`}
                          sx={{ pl: 8 }}
                        >
                          <ListItemText primary="Labels" />
                        </ListItem>
                        <ListItem
                          button
                          component={Link}
                          to={`/home/projects/${project.project_id}/sprints`}
                          sx={{ pl: 8 }}
                        >
                          <ListItemText primary="Sprints" />
                        </ListItem>
                      </List>
                    </Collapse>
                  </React.Fragment>
                ))}
              </List>
            </Collapse>
          </List>
          <List sx={{ mt: "auto" }}>
            <ListItem button component={Link} to="profile">
              <ListItemText primary="Profile" />
            </ListItem>
            <ListItem button component={Link} to="settings">
              <ListItemText primary="Settings" />
            </ListItem>
            <ListItem button onClick={handleLogoutClick}>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          p: 3,
          ml: `${drawerWidth}px`,
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Dashboard;
