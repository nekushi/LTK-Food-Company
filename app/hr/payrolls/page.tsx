"use client";

import { useState } from "react";

export default function HRPayrollsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<unknown>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setParsed(null);
  };

  const handleUpload = () => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      try {
        const rows = text.split(/\r?\n/).map((row) => row.split(/[\t,]/));
        setParsed(rows);
        console.log("Excel-like parse (CSV)", rows);
      } catch {
        setParsed({ error: "Parse failed" });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-xl font-semibold text-amber-900">Payrolls</h1>
      <p className="text-amber-800/80">
        Upload Excel file → convert to JSON for attendance card (fingerprint
        biometrics).
      </p>
      <div className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="text-sm text-amber-900"
          />
          <button
            type="button"
            onClick={handleUpload}
            disabled={!file}
            className="rounded-lg bg-amber-500 px-4 py-2 font-medium text-white hover:bg-amber-600 disabled:opacity-50"
          >
            Upload & convert
          </button>
        </div>
        {parsed !== null && (
          <pre className="mt-4 max-h-64 overflow-auto rounded border border-amber-200 bg-amber-50/50 p-3 text-xs text-amber-900">
            {JSON.stringify(parsed, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
