import AuthRoute from "./AuthRoute.js";
import React from "react";

const PublicRoute = ({ children }) => (
  <AuthRoute
    checkAuth={(isAuthenticated) => !isAuthenticated}
    redirectTo="/home"
  >
    {children}
  </AuthRoute>
);

export default PublicRoute;
