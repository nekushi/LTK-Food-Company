"use client";

import { TypeScheduleGeo } from "@/index";
import { convertToTimeFormat } from "@/utils/excelTImeFormat";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

function parseTimeToMinutes(t: string | null | undefined): number {
  if (!t || t === "---" || t.includes("NaN")) return -1;
  const parts = t.split(":");
  if (parts.length !== 2) return -1;
  const [h, m] = parts.map(Number);
  if (isNaN(h) || isNaN(m)) return -1;
  return h * 60 + m;
}

function calculateTotalHours(values: any): { error?: string, minutes?: number, fullText?: string } {
  const morIn = parseTimeToMinutes(values.morning_in);
  const morOut = parseTimeToMinutes(values.morning_out);
  const aftIn = parseTimeToMinutes(values.afternoon_in);
  const aftOut = parseTimeToMinutes(values.afternoon_out);
  const ovIn = parseTimeToMinutes(values.overtime_in);
  const ovOut = parseTimeToMinutes(values.overtime_out);

  const pairs = [
    [morIn, morOut],
    [aftIn, aftOut],
    [ovIn, ovOut],
  ];

  for (const [inTime, outTime] of pairs) {
    if ((inTime === -1 && outTime !== -1) || (inTime !== -1 && outTime === -1)) {
      return { error: 'invalid_odd' };
    }
  }

  let totalMinutes = 0;
  let tardiness = 0;

  if (morIn !== -1 && morOut !== -1) {
    const expectedMorIn = Math.round(morIn / 60) * 60;
    const late = morIn - expectedMorIn;
    if (late > 5) {
      tardiness += 60;
    } else if (late > 0) {
      tardiness += late;
    }
    totalMinutes += (morOut - expectedMorIn);
  }

  if (aftIn !== -1 && aftOut !== -1) {
    const expectedAftIn = morOut !== -1 ? morOut + 60 : Math.round(aftIn / 60) * 60;
    const late = aftIn - expectedAftIn;
    if (late > 0) {
      tardiness += late;
    }
    totalMinutes += (aftOut - expectedAftIn);
  }

  if (ovIn !== -1 && ovOut !== -1) {
    const expectedOvIn = Math.round(ovIn / 60) * 60;
    const late = ovIn - expectedOvIn;
    if (late > 0) {
      tardiness += late;
    }
    totalMinutes += (ovOut - expectedOvIn);
  }

  if (totalMinutes === 0) return { minutes: 0, fullText: "0 hours" };

  const actualMinutes = totalMinutes - tardiness;
  const hours = Math.floor(actualMinutes / 60);
  const mins = actualMinutes % 60;
  
  let timeStr = `${hours} hours`;
  if (mins > 0) {
      timeStr = `${hours} hours and ${mins} minutes`;
  }
  
  if (tardiness > 0) {
    return { minutes: actualMinutes, fullText: `${timeStr} - tardiness: ${tardiness} minutes` };
  }
  return { minutes: actualMinutes, fullText: timeStr };
}

export default function WorkDataMonth({
  scheduleData,
  onCalculate,
}: {
  scheduleData: [string, TypeScheduleGeo];
  onCalculate?: (dateId: string, minutes: number | null) => void;
}) {
  const [dateId, schedule] = scheduleData;
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [values, setValues] = useState({
    morning_in: convertToTimeFormat(schedule.in_out.morning.morning_in),
    morning_out: convertToTimeFormat(schedule.in_out.morning.morning_out),
    afternoon_in: convertToTimeFormat(schedule.in_out.afternoon.afternoon_in),
    afternoon_out: convertToTimeFormat(schedule.in_out.afternoon.afternoon_out),
    overtime_in: convertToTimeFormat(schedule.in_out.overtime.overtime_in),
    overtime_out: convertToTimeFormat(schedule.in_out.overtime.overtime_out),
  });

  const [calculatedTotal, setCalculatedTotal] = useState<string>("---");
  const [calculationDetails, setCalculationDetails] = useState<string>("Not calculated yet.");

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = () => closeContextMenu();
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleEdit = () => {
    setIsEditing(!isEditing);
    closeContextMenu();
  };

  const handleCalculate = () => {
    const output = calculateTotalHours(values);
    
    if (output.error === "invalid_odd") {
      // Do nothing, leave it as "---" per the instruction
    } else if (output.error) {
      setCalculatedTotal("");
      setCalculationDetails(output.error);
      if (onCalculate) onCalculate(dateId, null);
    } else {
      setCalculatedTotal(String(output.minutes));
      setCalculationDetails(output.fullText || "");
      if (onCalculate) onCalculate(dateId, output.minutes ?? 0);
    }
    
    closeContextMenu();
  };

  const handleChange = (key: keyof typeof values, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const renderCell = (key: keyof typeof values, originalRaw: string | null) => {
    const originalConverted = convertToTimeFormat(originalRaw);

    if (isEditing && (originalConverted === "---" || originalConverted === "NaN:NaN")) {
      return (
        <input
          type="text"
          value={values[key] === "---" || values[key] === "NaN:NaN" ? "" : values[key]}
          onChange={(e) => handleChange(key, e.target.value)}
          className="w-full px-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      );
    }
    return values[key];
  };

  // Prevent parent context menus from triggering if we are using custom one
  // but it's fine since we e.preventDefault() in handleContextMenu.

  return (
    <>
      {dateId && (
        <tr
          onContextMenu={handleContextMenu}
          className={`odd:bg-white even:bg-blue-50 *:text-sm *:font-normal *:text-slate-800 tabular-nums *:py-2 relative hover:bg-blue-100 transition-colors cursor-context-menu ${
            isEditing ? "ring-2 ring-blue-400 z-10 block table-row" : ""
          }`}
        >
          <td className="pl-6 text-left">
            {dateId} / {schedule.week}
          </td>
          <td className="px-2">
            {renderCell("morning_in", schedule.in_out.morning.morning_in)}
          </td>
          <td className="px-2">
            {renderCell("morning_out", schedule.in_out.morning.morning_out)}
          </td>
          <td className="px-2">
            {renderCell("afternoon_in", schedule.in_out.afternoon.afternoon_in)}
          </td>
          <td className="px-2">
            {renderCell(
              "afternoon_out",
              schedule.in_out.afternoon.afternoon_out,
            )}
          </td>
          <td className="px-2">
            {renderCell("overtime_in", schedule.in_out.overtime.overtime_in)}
          </td>
          <td className="px-2">
            {renderCell("overtime_out", schedule.in_out.overtime.overtime_out)}
          </td>
          <td 
            className="px-2 font-semibold text-center cursor-pointer hover:underline text-blue-600"
            onClick={() => calculatedTotal !== "---" && alert(calculationDetails)}
            title="Click to show detailed calculation"
          >
            {calculatedTotal}
          </td>
        </tr>
      )}

      {mounted &&
        contextMenu &&
        createPortal(
          <div
            className="fixed z-50 bg-white border border-slate-200 shadow-xl rounded-lg py-1 w-32 left-0 top-0 overflow-hidden"
            style={{
              transform: `translate(${contextMenu.x}px, ${contextMenu.y}px)`,
            }}
          >
            <button
              onClick={handleEdit}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:outline-none font-medium transition-colors"
            >
              {isEditing ? "Save and Exit" : "Edit"}
            </button>
            <button
              onClick={handleCalculate}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:outline-none font-medium transition-colors"
            >
              Calculate
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
