"use client";

import { TypeScheduleGeo } from "@/index";
import { convertToTimeFormat } from "@/utils/excelTImeFormat";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function WorkDataMonth({
  scheduleData,
}: {
  scheduleData: [string, TypeScheduleGeo];
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
    // Empty for future purposes
    console.log("Calculate clicked");
    closeContextMenu();
  };

  const handleChange = (key: keyof typeof values, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const renderCell = (key: keyof typeof values, originalRaw: string | null) => {
    const originalConverted = convertToTimeFormat(originalRaw);

    if (isEditing && originalConverted === "---") {
      return (
        <input
          type="text"
          value={values[key] === "---" ? "" : values[key]}
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
