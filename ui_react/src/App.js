import {
  RouterProvider,
  createRouter,
  createRoute,
  createRootRoute,
  Navigate,
} from "@tanstack/react-router";
import React from "react";
import Projects from "./components/Projects";
import Start from "./components/Start";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import Settings from "./components/Settings";
import Login from "./components/Login";
import Register from "./components/Register";
import ProtectedRoute from "./routetypes/ProtectedRoute";
import PublicRoute from "./routetypes/PublicRoute";
import AddProject from "./components/AddProject";
import EditProject from "./components/EditProject";
import ProjectDetail from "./components/ProjectDetails";
import EditTask from "./components/EditTask";
import AddTask from "./components/AddTask";
import AddLabel from "./components/AddLabel";
import AddSprint from "./components/AddSprint";
import { DialogProvider } from "./services/DialogService";
import { ThemeProvider } from "./services/ThemeContext";
import { IdleTimerProvider } from "./services/IdleTimerContext";
import { LoadingProvider } from "./services/LoadingContext";
import AppContent from "./components/AppContent";
import axios from "axios";
import config from "./config/config";
axios.defaults.baseURL = config.BASE_URL;
axios.defaults.withCredentials = true;

const rootRoute = createRootRoute({
  component: () => (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  ),
});

const rootRedirectRoute = createRoute({
  path: "/",
  component: () => <Navigate to="/start" />,
  getParentRoute: () => rootRoute,
});

const startRoute = createRoute({
  path: "start",
  component: () => (
    <PublicRoute>
      <Start />
    </PublicRoute>
  ),
  getParentRoute: () => rootRoute,
});

const loginRoute = createRoute({
  path: "login",
  component: () => (
    <PublicRoute>
      <Login />
    </PublicRoute>
  ),
  getParentRoute: () => rootRoute,
});

const registerRoute = createRoute({
  path: "register",
  component: () => (
    <PublicRoute>
      <Register />
    </PublicRoute>
  ),
  getParentRoute: () => rootRoute,
});

const dashboardHomeRoute = createRoute({
  path: "home",
  component: () => (
    <IdleTimerProvider>
      <ProtectedRoute>
        <Dashboard />{" "}
      </ProtectedRoute>
    </IdleTimerProvider>
  ),
  getParentRoute: () => rootRoute,
});

const projectsRoute = createRoute({
  path: "projects",
  component: Projects,
  getParentRoute: () => dashboardHomeRoute,
});

const profileRoute = createRoute({
  path: "profile",
  component: Profile,
  getParentRoute: () => dashboardHomeRoute,
});

const settingsRoute = createRoute({
  path: "settings",
  component: Settings,
  getParentRoute: () => dashboardHomeRoute,
});

const addProjectRoute = createRoute({
  path: "add_project",
  component: AddProject,
  getParentRoute: () => dashboardHomeRoute,
});

const editProjectRoute = createRoute({
  getParentRoute: () => dashboardHomeRoute,
  path: "edit_project/$projectId",
  component: EditProject,
});

const projectDetailsRoute = createRoute({
  getParentRoute: () => dashboardHomeRoute,
  path: "projects/$projectId/tasks",
  component: ProjectDetail,
});

const taskEdit = createRoute({
  getParentRoute: () => dashboardHomeRoute,
  path: "projects/$projectId/tasks/$taskId",
  component: EditTask,
});

const addTask = createRoute({
  getParentRoute: () => dashboardHomeRoute,
  path: "projects/$projectId/addtask",
  component: AddTask,
});

const addLabel = createRoute({
  getParentRoute: () => dashboardHomeRoute,
  path: "projects/$projectId/labels",
  component: AddLabel,
});

const addSprint = createRoute({
  getParentRoute: () => dashboardHomeRoute,
  path: "projects/$projectId/sprints",
  component: AddSprint,
});

const redirectRoute = createRoute({
  path: "*",
  component: () => <Navigate to="/start" />,
  getParentRoute: () => rootRoute,
});

dashboardHomeRoute.addChildren([
  profileRoute,
  settingsRoute,
  projectsRoute,
  addProjectRoute,
  editProjectRoute,
  projectDetailsRoute,
  taskEdit,
  addTask,
  addLabel,
  addSprint,
]);

const router = createRouter({
  routeTree: rootRoute.addChildren([
    startRoute,
    loginRoute,
    registerRoute,
    dashboardHomeRoute,
    redirectRoute,
    rootRedirectRoute,
  ]),
});

const App = () => (
  <LoadingProvider>
    <ThemeProvider>
      <DialogProvider>
        <RouterProvider router={router}></RouterProvider>
      </DialogProvider>
    </ThemeProvider>
  </LoadingProvider>
);

export default App;
