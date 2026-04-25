import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import Onboarding from "./components/onboarding/Onboarding";

import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Log from "./pages/Log";
import Calendar from "./pages/Calendar";
import LogPeriod from "./pages/LogPeriod";
import LogSymptoms from "./pages/LogSymptoms";
import Insights from "./pages/Insights";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import AuthChoice from "./pages/AuthChoice";

import ProtectedRoute from "./routes/ProtectedRoute";
import { useUser } from "./context/UserContext";

import { initAutoSync } from "./utils/cloudSyncService";
import { readData } from "./utils/storageService";
import {
  runMigrationIfNeeded,
  getUserMigrationStatus,
  completeUserMigration,
} from "./utils/migrationUtils";

function App() {
  const { userType, user, isGuest, isLoading } = useUser();

  useEffect(() => {
    if (user?.uid) {
      initAutoSync(user.uid);
    }
  }, [user]);

  const [completed, setCompleted] = useState(null);

  useEffect(() => {
    const data = readData("rithuma_onboarding", {
      userId: user?.uid,
      userType,
    });

    setCompleted(data);
  }, [userType, user]);

  useEffect(() => {
    runMigrationIfNeeded(userType);

    // ✅ If migration pending → complete it automatically
    const status = getUserMigrationStatus();

    if (userType === "authenticated" && status === "pending") {
      console.log("🔄 Completing user migration...");
      completeUserMigration();
    }
  }, [userType]);

  // 🔐 Auth / Guest Gate
  if (isLoading) return null;

  // 🧭 Onboarding gate
  if (!completed) {
    return <Onboarding onComplete={() => setCompleted(true)} />;
  }

  return (
    <AppLayout>
      <Routes>
        {/* 🔓 Public */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/auth-choice" element={<AuthChoice />} />

        {/* 🔐 Protected */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/log"
          element={
            <ProtectedRoute>
              <Log />
            </ProtectedRoute>
          }
        />

        <Route
          path="/log-period"
          element={
            <ProtectedRoute>
              <LogPeriod />
            </ProtectedRoute>
          }
        />

        <Route
          path="/log-symptoms"
          element={
            <ProtectedRoute>
              <LogSymptoms />
            </ProtectedRoute>
          }
        />

        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          }
        />

        <Route
          path="/insights"
          element={
            <ProtectedRoute>
              <Insights />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* 🚨 Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default App;
