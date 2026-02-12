"use client";

import { linkToEmployee, postExcelFile } from "@/dal/geo";
import React, { useState, useRef } from "react";
import EmployeeWorkData from "@/app/dashboard/human-resource/workData";
import { TypeAttendanceCardGeo } from "@/index";

export default function ExcelForm() {
  const [store, setStore] = useState("pila");
  const [excelFile, setExcelFile] = useState([]);
  const [approvedData, setApprovedData] = useState<TypeAttendanceCardGeo[]>([]);

  const handleLinkDataClick = async () => {
    // console.log(approvedData);

    const res = await linkToEmployee(approvedData);
    console.log(res);
  };

  const handleApprovedData = (newData: TypeAttendanceCardGeo) => {
    setApprovedData([...approvedData, newData]);
    // console.log(approvedData);
  };

  const handleStoreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStore(e.target.value);
    setExcelFile([]);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/excel/${store}`, {
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
      <select
        name="stores"
        id="stores"
        defaultValue={store}
        onChange={handleStoreChange}
      >
        <option value="geo">Geo</option>
        <option value="pila">Pila</option>
      </select>
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
          className="py-1 px-4 bg-red-200 border-red-200 rounded-md font-medium hover:bg-red-300 active:bg-red-400 transition"
        >
          Clear upload
        </button>
      </form>
      {excelFile.length !== 0 &&
        store === "geo" &&
        excelFile.map((data: TypeAttendanceCardGeo) => (
          <EmployeeWorkData
            key={data.id}
            store={store}
            data={data}
            onApprovedData={handleApprovedData}
          />
        ))}
      {excelFile.length !== 0 && store === "pila" && (
        <pre>{JSON.stringify(excelFile, null, 2)}</pre>
      )}
      <button
        onClick={handleLinkDataClick}
        className="border px-2 py-1 rounded"
      >
        Link names
      </button>
    </div>
  );
}
