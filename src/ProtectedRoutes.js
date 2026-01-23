import { useAuth } from "./contexts/AuthContext.js";
import { Navigate, useLocation } from "react-router-dom";

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // Or a spinner

  if (!user) {
    // Redirect to login but save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if((user && user.role !== "admin" && location.pathname === "/stores/new") ||
     (user && user.role !== "admin" && location.pathname.includes("/edit"))) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
