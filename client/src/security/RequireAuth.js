import { Navigate } from "react-router-dom";
import { useAuthUser } from "./AuthContext";

function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuthUser();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default RequireAuth;
