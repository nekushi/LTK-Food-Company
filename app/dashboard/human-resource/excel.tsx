"use client";

import { linkToEmployee, postExcelFile } from "@/dal/geo";
// import * as XLSX from "xlsx";
import React, { useState, useRef } from "react";
import EmployeeWorkData from "./workData";

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

  return (
    <div className="">
      <br />
      <div>Enter excel file</div>
      <input
        type="file"
        onChange={handleUpload}
        className="border border-black rounded my-4"
      />
      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
      {excelFile.map((data: any) => (
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
