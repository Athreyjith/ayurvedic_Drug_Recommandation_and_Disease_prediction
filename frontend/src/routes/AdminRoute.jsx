import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import AdminDashboard from "../features/admin/AdminDashboard";

export default function AdminRoute() {
  const { user } = useAuth();
  if (user?.role !== "admin" && user?.role !== "doctor") {
    return <Navigate to="/" replace />;
  }
  return <AdminDashboard />;
}
