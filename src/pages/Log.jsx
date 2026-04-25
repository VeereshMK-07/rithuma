import { useNavigate } from "react-router-dom";
import { readData } from "../utils/storageService";
import { useUser } from "../context/UserContext";

export default function Log() {
  const navigate = useNavigate();
  const { user } = useUser();

  const lastPeriod = readData("rithuma_last_period", {
  userId: user?.uid,
});

  return (
    <div className="mt-6 space-y-6">

      {/* Period Card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-sm text-gray-500 mb-1">Period</p>

        <button
          onClick={() => navigate("/log-period")}
          className="text-lavender font-semibold text-lg"
        >
          Log Period
        </button>

        {lastPeriod && (
          <p className="text-sm text-gray-600 mt-1">
            Last period:{" "}
            {new Date(lastPeriod).toDateString()}
          </p>
        )}
      </div>

      {/* Symptoms Card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <p className="text-sm text-gray-500 mb-1">Symptoms</p>

        <button
          onClick={() => navigate("/log-symptoms")}
          className="font-semibold text-lg"
        >
          Log Symptoms
        </button>

        <p className="text-sm text-gray-600 mt-1">
          Track how you're feeling today
        </p>
      </div>

    </div>
  );
}
