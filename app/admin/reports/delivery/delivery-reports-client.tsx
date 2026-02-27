"use client";

import { useMemo, useRef, useState } from "react";
import { FiPrinter } from "react-icons/fi";

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

  const byBranch = useMemo(() => {
    const map = new Map<string, DeliveryHistoryRow[]>();
    history.forEach((h) => {
      const b = h.storeUsername;
      if (!map.has(b)) map.set(b, []);
      map.get(b)!.push(h);
    });
    return branches.map((b) => ({ branchName: b, rows: map.get(b) ?? [] }));
  }, [history, branches]);

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
          <title>Delivery Reports — ${selectedBranch === "all" ? "All Branches" : selectedBranch}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 2rem; color: #451a03; }
            h1 { font-size: 1.25rem; margin-bottom: 0.25rem; }
            h2 { font-size: 1rem; margin-top: 1.5rem; margin-bottom: 0.5rem; color: #92400e; }
            .meta { font-size: 0.75rem; color: #92400e; margin-bottom: 1rem; }
            table { width: 100%; border-collapse: collapse; font-size: 0.8rem; margin-bottom: 1.5rem; }
            th, td { padding: 6px 8px; text-align: left; border-bottom: 1px solid #fde68a; }
            th { font-weight: 600; border-bottom: 2px solid #d97706; }
            .text-right { text-align: right; }
            .print-branch-section { page-break-after: always; }
            .print-branch-section:last-child { page-break-after: auto; }
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
      <div>
        <h1 className="text-xl font-semibold text-amber-900">Delivery Reports</h1>
        <p className="text-sm text-amber-700/80 mt-1">
          Delivery history for the past 30 days. Each branch prints separately when printing all.
        </p>
      </div>

      {history.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-12 text-center">
          <p className="text-amber-800/80 text-sm">No delivery activity recorded in the past 30 days.</p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm max-w-2xl">
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-amber-900 mb-1">Branch</label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="all">All branches</option>
                {branches.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-semibold text-amber-900">
                Delivery — {selectedBranch === "all" ? "All Branches" : selectedBranch}
              </h2>
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100 transition-colors"
              >
                <FiPrinter className="text-base" />
                Print
              </button>
            </div>

            <div ref={printRef}>
              {selectedBranch === "all" ? (
                byBranch.map(({ branchName, rows }, i) => (
                  <div key={branchName} className={i < byBranch.length - 1 ? "print-branch-section" : ""} style={i < byBranch.length - 1 ? { pageBreakAfter: "always" } : undefined}>
                    <h2 className="text-base font-semibold text-amber-900 border-b border-amber-200 pb-2 mb-4">{branchName}</h2>
                    {rows.length > 0 ? (
                      <table className="w-full min-w-[720px] table-auto text-left text-sm">
                        <thead><tr className="border-b border-amber-200 bg-amber-50">
                          <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-amber-900">Date</th>
                          <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-amber-900">Item</th>
                          <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-amber-900">Qty</th>
                          <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-amber-900">Status</th>
                        </tr></thead>
                        <tbody className="divide-y divide-amber-100">
                          {rows.map((row) => {
                            const date = new Date(row.createdAt);
                            const dateLabel = isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
                            return (
                              <tr key={row.id} className="hover:bg-amber-50/60">
                                <td className="px-5 py-3.5 text-sm text-amber-900">{dateLabel}</td>
                                <td className="px-5 py-3.5 text-sm text-amber-900">{row.productNameGeneral}</td>
                                <td className="px-5 py-3.5 text-sm text-amber-900">{row.quantity} <span className="text-xs text-amber-600">{row.unitOfMeasurement}</span></td>
                                <td className="px-5 py-3.5 text-xs"><span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 font-semibold text-amber-700">{row.status ?? "N/A"}</span></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : <p className="text-sm text-amber-600/70 italic py-4">No delivery records for this branch.</p>}
                  </div>
                ))
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] table-auto text-left text-sm">
                    <thead><tr className="border-b border-amber-200 bg-amber-50">
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-amber-900">Date</th>
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-amber-900">Branch</th>
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-amber-900">Item</th>
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-amber-900">Qty</th>
                      <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-amber-900">Status</th>
                    </tr></thead>
                    <tbody className="divide-y divide-amber-100">
                      {filtered.map((row) => {
                        const date = new Date(row.createdAt);
                        const dateLabel = isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
                        return (
                          <tr key={row.id} className="hover:bg-amber-50/60">
                            <td className="px-5 py-3.5 text-sm text-amber-900">{dateLabel}</td>
                            <td className="px-5 py-3.5 text-sm text-amber-900">{row.storeUsername}</td>
                            <td className="px-5 py-3.5 text-sm text-amber-900">{row.productNameGeneral}</td>
                            <td className="px-5 py-3.5 text-sm text-amber-900">{row.quantity} <span className="text-xs text-amber-600">{row.unitOfMeasurement}</span></td>
                            <td className="px-5 py-3.5 text-xs"><span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 font-semibold text-amber-700">{row.status ?? "N/A"}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

