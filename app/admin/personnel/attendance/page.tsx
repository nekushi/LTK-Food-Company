"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import EmployeeWorkDataGeo from "@/components/geo/workData";
import EmployeeWorkDataPila from "@/components/pila/workData";
import { TypeAttendanceCardGeo, TypeAttendanceCardReturnPila } from "@/index";
import { linkToEmployees } from "@/dal/hr/linkToEmployee";
import { toast } from "react-toastify";

export default function AdminAttendancePage() {
  // const [store, setStore] = useState<"geo" | "pila">("geo");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [excelFileGeo, setExcelFileGeo] = useState<TypeAttendanceCardGeo[]>([]);
  const [approvedData, setApprovedData] = useState<TypeAttendanceCardGeo[]>([]);

  const handleLinkToEmployee = async () => {
    if (approvedData.length === 0) {
      toast.warning("No approved cards to link. Approve cards first.");
      return;
    }
    const result = await linkToEmployees(approvedData);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message ?? "Failed to link data");
    }
  };

  const handleStoreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // setStore(e.target.value as "geo" | "pila");
    setExcelFileGeo([]);
    setApprovedData([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
  };

  const handleApprovedData = (newData: TypeAttendanceCardGeo) => {
    setApprovedData((prev) => [...prev, newData]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // const res = await fetch(`/api/excel/${store}`, {
      const res = await fetch(`/api/excel/geo`, {
        method: "POST",
        body: formData,
      });

      const results = await res.json();

      setExcelFileGeo(results);
    } catch (error) {
      console.error("Failed to upload and parse Excel:", error);
      toast.error("Failed to upload and parse Excel");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearForm = () => {
    setFile(null);
    setExcelFileGeo([]);
    setApprovedData([]);
    const fileInput = document.getElementById(
      "excel-upload",
    ) as HTMLInputElement | null;
    if (fileInput) fileInput.value = "";
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-amber-900">
          Attendance Integration
        </h1>
        <p className="text-sm text-amber-700/80 mt-1">
          Select store, upload Excel file, and preview the extracted biometrics.
          Approve cards then link to employees.
        </p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="excel-upload"
              className="text-xs font-semibold text-amber-900"
            >
              Excel File
            </label>
            <input
              id="excel-upload"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="text-sm text-amber-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200"
            />
          </div>

          <div className="flex gap-2 self-end">
            <button
              type="button"
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="mt-5 rounded-lg bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 transition"
            >
              {isUploading ? "Processing..." : "Upload & Parse"}
            </button>
            <button
              type="button"
              onClick={handleClearForm}
              className="mt-5 rounded-lg border border-amber-200 bg-white px-4 py-2.5 text-sm font-medium text-amber-800 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {excelFileGeo.length > 0 ? (
        <div className="space-y-4">
          {excelFileGeo.map((data: TypeAttendanceCardGeo) => (
            <EmployeeWorkDataGeo
              key={data.id}
              data={data}
              onApprovedData={handleApprovedData}
            />
          ))}
        </div>
      ) : (
        <div>Add Excel File First</div>
      )}

      {approvedData.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-amber-800 mb-3">
            {approvedData.length} card{approvedData.length !== 1 ? "s" : ""}{" "}
            approved — link to employees
          </p>
          <button
            type="button"
            onClick={handleLinkToEmployee}
            className="rounded-lg bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-800 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            Link to employees
          </button>
        </div>
      )}
    </div>
  );
}
