import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

import CycleLengthSetting from "../components/CycleLengthSetting";
import PrivacyData from "../components/PrivacyData";
import {
  getUserMigrationStatus,
  completeUserMigration,
} from "../utils/migrationUtils";

export default function Profile({ setScreen }) {
  const { user, userType, logout, isGuest } = useUser();
  const isAuthenticated = userType === "authenticated";
  const navigate = useNavigate();

  const [migrationStatus, setMigrationStatus] = useState(null);

  useEffect(() => {
    setMigrationStatus(getUserMigrationStatus());
  }, []);

  function handleConfirmMigration() {
    completeUserMigration();
    setMigrationStatus("completed");
  }

  function handleLogout() {
    logout();
    alert("Logged out successfully");
  }

  return (
    <div className="mt-6 px-4 space-y-6">
      <h2 className="text-xl font-semibold text-lavender">Profile</h2>

      {/* 👤 Account Section (ONLY this changes) */}
      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-2">
        <p className="text-sm text-gray-500">Account</p>

        {isGuest && (
          <>
            <p className="text-sm text-gray-700">
              You are using RITHUMA as a guest.
            </p>

            <button
              onClick={() => navigate("/auth")}
              className="mt-2 px-4 py-2 rounded-lg bg-lavender text-white text-sm font-medium"
            >
              Sign in / Create account
            </button>
          </>
        )}

        {isAuthenticated && (
          <>
            <p className="text-sm text-gray-700">Signed in as</p>
            <p className="font-medium text-lavender">{user.email}</p>

            <button
              onClick={handleLogout}
              className="mt-2 px-4 py-2 rounded-lg bg-red-100 text-red-600 text-sm font-medium"
            >
              Log out
            </button>
          </>
        )}
      </div>

      {/* 🔐 Migration banner (unchanged) */}
      {migrationStatus === "pending" && (
        <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-4 space-y-2">
          <p className="font-medium text-yellow-900">
            🔁 Secure data migration detected
          </p>
          <p className="text-sm text-yellow-800">
            We found existing cycle data on this device.  
            Confirm to securely associate it with your account.
          </p>
          <button
            onClick={handleConfirmMigration}
            className="mt-2 px-4 py-2 rounded-lg bg-lavender text-white text-sm font-medium"
          >
            Confirm migration
          </button>
        </div>
      )}

      {/* ✅ ORIGINAL UI RESTORED */}
      <CycleLengthSetting />
      <PrivacyData />
    </div>
  );
}
