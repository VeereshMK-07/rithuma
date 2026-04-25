import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { writeData } from "../utils/storageService";
import { useUser } from "../context/UserContext";

function LogPeriod({ onDone }) {
  const [date, setDate] = useState("");

  // 🔐 get current user info
  const { user, userType } = useUser();

  const navigate = useNavigate();

  const savePeriod = () => {
    if (!date) {
      alert("Please select a date 🌸");
      return;
    }

    /*  Save last period */
    writeData("rithuma_last_period", date, {
      userId: user?.uid,
      userType,
    });

    /*  ALSO UPDATE CYCLE DATA */
    const cycleData = {
      lastPeriodStart: date,
    };

    writeData("rithuma_cycle", cycleData, {
      userId: user?.uid,
      userType,
    });

    
    navigate("/");
  };

  return (
    <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-lavender mb-4">
        Log your period
      </h2>

      <p className="text-sm text-gray-600 mb-6">
        Select the first day of your period.
      </p>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full border border-lilac rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-lavender"
      />

      <button
        onClick={savePeriod}
        className="mt-6 w-full bg-lavender text-white py-3 rounded-xl"
      >
        Save
      </button>
    </div>
  );
}

export default LogPeriod;
