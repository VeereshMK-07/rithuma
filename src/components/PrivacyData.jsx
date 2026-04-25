import { useState } from "react";
import { jsPDF } from "jspdf";
import { readData, removeData } from "../utils/storageService";
import { useUser } from "../context/UserContext";

/* ------------------ Helpers ------------------ */

function formatDate(dateStr) {
  if (!dateStr) return "Not recorded yet";

  const d = new Date(dateStr + "T00:00:00"); // ✅ FIX

  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function drawPageBorder(doc) {
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.rect(8, 8, 194, 281);
}

/* ------------------ Component ------------------ */

export default function PrivacyData() {
  const [showData, setShowData] = useState(false);
  const [data, setData] = useState(null);
  const { user, userType } = useUser();

  const scope = {
    userId: user ? user.uid : "guest",
    userType: user ? "authenticated" : "guest",
  };

  /* ---------- View Data ---------- */

  function handleViewData() {
    const allData = {
      rithuma_last_period: readData("rithuma_last_period", scope),
      rithuma_cycle_length: readData("rithuma_cycle_length", scope) || 28,
      rithuma_symptoms: readData("rithuma_symptoms", scope) || {},
    };

    setData(allData);
    setShowData(true);
  }

  /* ---------- Export PDF ---------- */

  function handleExportPDF() {
    const allData = {
      rithuma_last_period: readData("rithuma_last_period", scope),
      rithuma_cycle_length: readData("rithuma_cycle_length", scope) || 28,
      rithuma_symptoms: readData("rithuma_symptoms", scope) || {},
    };

    const doc = new jsPDF();
    let y = 20;

    drawPageBorder(doc);

    // Header
    doc.setFontSize(18);
    doc.text("RITHUMA – Personal Cycle Summary", 14, y);
    y += 8;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
      "Generated from your self-logged cycle and symptom data stored locally on this device.",
      14,
      y,
    );
    y += 10;

    doc.setTextColor(0);
    doc.setDrawColor(180);
    doc.line(14, y, 196, y);
    y += 10;

    // Cycle Overview
    doc.setFontSize(14);
    doc.text("Cycle Overview", 14, y);
    y += 8;

    doc.setFontSize(11);
    doc.text(
      `• Last period: ${
        allData.rithuma_last_period
          ? formatDate(allData.rithuma_last_period)
          : "Not recorded yet"
      }`,
      16,
      y,
    );
    y += 6;

    doc.text(
      `• Average cycle length: ${allData.rithuma_cycle_length} days`,
      16,
      y,
    );
    y += 10;

    // Divider
    doc.setDrawColor(180);
    doc.line(14, y, 196, y);
    y += 10;

    // Symptoms Log
    doc.setFontSize(14);
    doc.text("Symptoms Log", 14, y);
    y += 10;

    const symptomsData = allData.rithuma_symptoms;
    const sortedDates = Object.keys(symptomsData).sort(
      (a, b) => new Date(a) - new Date(b),
    );

    if (sortedDates.length > 0) {
      sortedDates.forEach((date) => {
        const symptoms = symptomsData[date] || [];

        if (y > 250) {
          doc.addPage();
          drawPageBorder(doc);
          y = 20;
        }

        doc.setFontSize(12);
        doc.text(`Date: ${formatDate(date)}`, 16, y);
        y += 6;

        doc.setFontSize(11);

        if (symptoms.length > 0) {
          symptoms.forEach((s) => {
            doc.text(`• ${s}`, 20, y);
            y += 5;
          });
        } else {
          doc.text("• No symptoms logged", 20, y);
          y += 5;
        }

        y += 6;
      });
    } else {
      doc.setFontSize(11);
      doc.text(
        "No symptoms have been logged yet. You can log daily symptoms from the Calendar.",
        16,
        y,
      );
    }

    // Medical note
    if (y > 240) {
      doc.addPage();
      drawPageBorder(doc);
      y = 20;
    }

    doc.setDrawColor(180);
    doc.line(14, y, 196, y);
    y += 8;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(
      "Health note:\nThis summary is based on self-logged data and is intended to support awareness\nand informed conversations with healthcare professionals. It does not replace\nprofessional medical advice or diagnosis.",
      14,
      y,
    );

    doc.save("rithuma-cycle-summary.pdf");
  }

  /* ---------- Clear Data ---------- */

  function handleClearData() {
    if (
      window.confirm(
        "This will permanently delete all your data from this device.",
      )
    ) {
      removeData("rithuma_last_period", scope);
      removeData("rithuma_cycle_length", scope);
      removeData("rithuma_symptoms", scope);
      removeData("rithuma_nudge_feedback", scope);

      setShowData(false);
      setData(null);
      alert("Your data has been cleared.");
    }
  }

  /* ---------- UI ---------- */

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">
        🔐 Privacy & Data Control
      </h3>

      <p className="text-sm text-gray-600">
        Your data stays on your device. You can view, export, or delete it
        anytime.
      </p>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleViewData}
          className="px-4 py-2 rounded-lg bg-lilac text-lavender text-sm font-medium"
        >
          View my data
        </button>

        <button
          onClick={handleExportPDF}
          className="px-4 py-2 rounded-lg bg-mint text-gray-900 text-sm font-medium"
        >
          Export as PDF
        </button>

        <button
          onClick={handleClearData}
          className="px-4 py-2 rounded-lg bg-red-100 text-red-700 text-sm font-medium"
        >
          Clear all data
        </button>
      </div>

      {showData && data && (
        <div className="bg-gray-50 rounded-lg p-4 text-sm max-h-64 overflow-y-auto">
          {Object.keys(data.rithuma_symptoms || {}).length > 0 ? (
            Object.keys(data.rithuma_symptoms)
              .sort((a, b) => new Date(a) - new Date(b))
              .map((date) => (
                <div key={date} className="mb-3">
                  <p className="font-medium text-gray-700">
                    Date: {formatDate(date)}
                  </p>
                  <ul className="list-disc ml-5 text-gray-600">
                    {data.rithuma_symptoms[date].map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              ))
          ) : (
            <p className="text-gray-500">
              No symptoms logged yet. Add symptoms from the Calendar.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
