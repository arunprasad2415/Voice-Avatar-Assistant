import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import AdminLogin from "../pages/AdminLogin";
import Dashboard from "../pages/Dashboard";
import Leads from "../pages/Leads";
import FAQs from "../pages/FAQs";
import VoiceResponses from "../pages/VoiceResponses";
import ProtectedRoute from "../components/ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/leads"
        element={
          <ProtectedRoute>
            <Leads />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/faqs"
        element={
          <ProtectedRoute>
            <FAQs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/voice-responses"
        element={
          <ProtectedRoute>
            <VoiceResponses />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Home />} />
    </Routes>
  );
};

export default AppRoutes;