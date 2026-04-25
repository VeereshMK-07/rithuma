import { useEffect, useState } from "react";
import {
  readData,
  writeData,
} from "../utils/storageService";

function CycleLengthSetting() {
  const [cycleLength, setCycleLength] = useState(28);

  // 🔄 Load saved cycle length on mount (centralized read)
  useEffect(() => {
    const savedLength =
      Number(readData("rithuma_cycle_length")) || 28;
    setCycleLength(savedLength);
  }, []);

  // 🔐 Update cycle length (centralized write)
  const updateLength = (newLength) => {
    if (newLength < 26 || newLength > 32) return;

    setCycleLength(newLength);
    writeData("rithuma_cycle_length", newLength);
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <p className="text-sm text-gray-500 mb-1">
        Cycle length
      </p>

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => updateLength(cycleLength - 1)}
          className="w-10 h-10 rounded-full bg-lilac text-lavender text-lg font-semibold"
        >
          −
        </button>

        <p className="text-lg font-semibold text-lavender">
          {cycleLength} days
        </p>

        <button
          onClick={() => updateLength(cycleLength + 1)}
          className="w-10 h-10 rounded-full bg-lilac text-lavender text-lg font-semibold"
        >
          +
        </button>
      </div>

      <p className="mt-3 text-xs text-gray-500 text-center">
        Typical cycle length is between 26 and 32 days
      </p>
    </div>
  );
}

export default CycleLengthSetting;
