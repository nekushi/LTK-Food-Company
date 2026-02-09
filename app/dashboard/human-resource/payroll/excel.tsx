"use client";

import { linkToEmployee, postExcelFile } from "@/dal/geo";
// import * as XLSX from "xlsx";
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
      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
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
