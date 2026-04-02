import { Navigate } from "react-router-dom";
import { isAuthenticated } from "@/store/auth.store";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = isAuthenticated();

  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
