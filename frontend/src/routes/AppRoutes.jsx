import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { AppLayout } from "../components/layout";
import { LoginPage, RegisterPage } from "../features/auth";
import HomePage from "../features/home/HomePage";
import PredictPage from "../features/prediction/PredictPage";
import DrugPage from "../features/drug/DrugPage";
import RecommendPage from "../features/recommend/RecommendPage";
import ChatPage from "../features/chat/ChatPage";
import DoctorPage from "../features/doctor/DoctorPage";
import FeedbackPage from "../features/feedback/FeedbackPage";
import ProfilePage from "../features/profile/ProfilePage";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

function GuestOnly({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestOnly>
            <LoginPage />
          </GuestOnly>
        }
      />
      <Route
        path="/register"
        element={
          <GuestOnly>
            <RegisterPage />
          </GuestOnly>
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/predict" element={<PredictPage />} />
          <Route path="/drug" element={<DrugPage />} />
          <Route path="/recommend" element={<RecommendPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/doctor" element={<DoctorPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminRoute />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
