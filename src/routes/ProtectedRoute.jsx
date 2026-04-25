import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function ProtectedRoute({ children }) {
  const { user, isGuest, isLoading } = useUser();

  if (isLoading) return null;

  // ❌ block only if neither logged in nor guest
  if (!user && !isGuest) {
    return <Navigate to="/auth-choice" replace />;
  }

  return children;
}