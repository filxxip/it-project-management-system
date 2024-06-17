import AuthRoute from "./AuthRoute.js";
import React from "react";

const ProtectedRoute = ({ children }) => (
  <AuthRoute
    checkAuth={(isAuthenticated) => isAuthenticated}
    redirectTo="/login"
  >
    {children}
  </AuthRoute>
);

export default ProtectedRoute;
