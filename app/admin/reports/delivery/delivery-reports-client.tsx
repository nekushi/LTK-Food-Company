"use client";

import { useMemo, useRef, useState } from "react";

interface DeliveryHistoryRow {
  id: string;
  productNameGeneral: string;
  quantity: number;
  unitOfMeasurement: string;
  storeId: string;
  storeUsername: string;
  isRequestApproved: boolean;
  status: string | null;
  deliveryStatus: string | null;
  note: string | null;
  createdAt: string;
}

export default function DeliveryReportsClient({ history }: { history: DeliveryHistoryRow[] }) {
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const printRef = useRef<HTMLDivElement | null>(null);

  const branches = useMemo(() => {
    const set = new Set<string>();
    history.forEach((h) => set.add(h.storeUsername));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [history]);

  const filtered = useMemo(
    () =>
      selectedBranch === "all"
        ? history
        : history.filter((h) => h.storeUsername === selectedBranch),
    [history, selectedBranch],
  );

  const handlePrint = () => {
    if (!printRef.current) return;
    const content = printRef.current.innerHTML;
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Delivery Reports</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 2rem; color: #451a03; }
            h1 { font-size: 1.25rem; margin-bottom: 0.25rem; }
            h2 { font-size: 0.9rem; margin-top: 1rem; margin-bottom: 0.5rem; color: #92400e; }
            .meta { font-size: 0.75rem; color: #92400e; margin-bottom: 1rem; }
            table { width: 100%; border-collapse: collapse; font-size: 0.8rem; margin-bottom: 1.5rem; }
            th, td { padding: 6px 8px; text-align: left; border-bottom: 1px solid #fde68a; }
            th { font-weight: 600; border-bottom: 2px solid #d97706; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            @media print { body { padding: 1rem; } }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-amber-900">Delivery Reports</h1>
          <p className="text-sm text-amber-700/80 mt-1">
            Delivery history for the past 30 days{selectedBranch !== "all" ? ` — ${selectedBranch}` : " across all branches"}.
          </p>
        </div>
        {history.length > 0 && (
          <button
            type="button"
            onClick={handlePrint}
            className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100 transition-colors"
          >
            Print
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-12 text-center">
          <p className="text-amber-800/80 text-sm">No delivery activity recorded in the past 30 days.</p>
        </div>
      ) : (
        <>
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-amber-900 mb-1">Branch</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">All branches</option>
              {branches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div ref={printRef} className="overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] table-auto text-left text-sm">
                <thead>
                  <tr className="border-b border-amber-200 bg-amber-50">
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-amber-900">
                      Date
                    </th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-amber-900">
                      Branch
                    </th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-amber-900">
                      Item
                    </th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-amber-900">
                      Qty
                    </th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-amber-900">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {filtered.map((row) => {
                    const date = new Date(row.createdAt);
                    const dateLabel = isNaN(date.getTime())
                      ? "N/A"
                      : date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
                    return (
                      <tr key={row.id} className="hover:bg-amber-50/60 transition-colors">
                        <td className="px-5 py-3.5 text-sm text-amber-900">{dateLabel}</td>
                        <td className="px-5 py-3.5 text-sm text-amber-900">{row.storeUsername}</td>
                        <td className="px-5 py-3.5 text-sm text-amber-900">{row.productNameGeneral}</td>
                        <td className="px-5 py-3.5 text-sm text-amber-900">
                          {row.quantity}{" "}
                          <span className="text-xs text-amber-600">{row.unitOfMeasurement}</span>
                        </td>
                        <td className="px-5 py-3.5 text-xs">
                          <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 font-semibold text-amber-700">
                            {row.status ?? "N/A"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

