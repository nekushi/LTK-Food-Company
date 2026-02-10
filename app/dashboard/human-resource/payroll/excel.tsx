"use client";

import { linkToEmployee, postExcelFile } from "@/dal/geo";
import React, { useState, useRef } from "react";
import EmployeeWorkData from "../workData";

export default function ExcelForm() {
  const [excelFile, setExcelFile] = useState([]);
  const [approvedData, setApprovedData] = useState<any>([]);

  const handleLinkDataClick = async () => {
    // console.log(approvedData);

    const res = await linkToEmployee(approvedData);
    console.log(res);
  };

  const handleApprovedData = (newData: any) => {
    setApprovedData([...approvedData, newData]);
    // console.log(approvedData);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/excel", {
      method: "POST",
      body: formData,
    });

    const results = await res.json();
    const employeeId = "00212";
    console.log(results);

    setExcelFile(results);
    postExcelFile(results, employeeId);
  };

  const handleClearForm = () => {
    setExcelFile([]);
  };

  // return (
  //   <div className="">
  //     <br />
  //     <form action="" className="flex flex-row">
  //       <input
  //         type="file"
  //         onChange={handleUpload}
  //         className="
  //           block w-auto text-sm text-gray-500
  //           file:mr-4 file:py-2 file:px-4
  //           file:rounded-md file:border-0
  //           file:text-sm file:font-semibold
  //           file:bg-blue-50 file:text-blue-700
  //           hover:file:bg-blue-100
  //         "
  //       />
  //       <button
  //         type="reset"
  //         onClick={handleClearForm}
  //         className="py-1 px-4 bg-red-200 border-red-200 rounded-md hover:bg-red-300 active:bg-red-400 transition"
  //       >
  //         Clear upload
  //       </button>
  //     </form>
  //     {excelFile.length !== 0 &&
  //       excelFile.map((data: any) => (
  //         <EmployeeWorkData
  //           key={data.id}
  //           data={data}
  //           onApprovedData={handleApprovedData}
  //         />
  //       ))}
  //     <button
  //       onClick={handleLinkDataClick}
  //       className="border px-2 py-1 rounded"
  //     >
  //       Link names
  //     </button>
  //   </div>
  // );

  return (
    <div className="">
      <br />
      <form action="" className="flex flex-row">
        <input
          type="file"
          onChange={handleUpload}
          className="
            block w-auto text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
          "
        />
        <button
          type="reset"
          onClick={handleClearForm}
          className="py-1 px-4 bg-red-200 border-red-200 rounded-md hover:bg-red-300 active:bg-red-400 transition"
        >
          Clear upload
        </button>
      </form>
      {excelFile.length !== 0 &&
        excelFile.map((data: any) => (
          <EmployeeWorkData
            key={data.id}
            data={data}
            onApprovedData={handleApprovedData}
          />
        ))}
      <button
        onClick={handleLinkDataClick}
        className="border px-2 py-1 rounded"
      >
        Link names
      </button>
    </div>
  );
}

/* 
    Page title
      “Month of October”
        text-2xl
        font-semibold
        tracking-tight
        Purpose: anchor the page without shouting.
        
    Employee name
      “naldz”
        text-xl
        font-semibold
      ID #00212
        text-sm
        text-slate-500
      This establishes identity hierarchy clearly.

    Stat cards (Working Days, Absences, etc.)
      Label:
        text-sm
        text-slate-500
        Value:
        text-2xl
        font-semibold
        tabular-nums
        👉 tabular-nums is critical so numbers align visually.

    Table headers
      text-sm
      font-medium
      text-slate-600
      uppercase ❌ (avoid — hurts readability)
      tracking-normal
      Headers should guide, not dominate.

    Table body (time values)
      text-sm
      font-normal
      text-slate-800
      tabular-nums

    Missing data (---)
      text-slate-400
      italic (optional)

    Secondary actions (links, pagination)
      text-sm
      text-slate-500
      Hover → text-slate-700

    3. Colors Used (calm, scalable, data-first)
    This UI works because color supports data, not decoration.

    🎨 Base palette (Tailwind-native)
      Background
        App background: slate-50
        Card background: white
        Secondary panels: slate-50 / blue-50 blend
        Soft contrast = less eye fatigue for long tables.

    Text
      Primary: slate-900
      Secondary: slate-600
      Muted / empty: slate-400
      No pure black — keeps it modern and readable.

    Borders & dividers
      slate-200
      slate-100 for row separators
      Keeps structure without visual noise.

  🚦 Semantic colors (used sparingly)
    These appear only in stats or highlights, not everywhere.
      Success / Attendance
        emerald-500
       Warning / Early
        amber-500
      Error / Absence
        rose-500
      Overtime
        indigo-500
      Rule:
        Color = meaning, not decoration.
*/
