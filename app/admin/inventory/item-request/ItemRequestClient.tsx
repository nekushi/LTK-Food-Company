"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import type {
  RequestedItemHistoryEntry,
  MergedItemReturnTypeInventoryWithStore,
} from "@/dal/inventory/get-requested-items";
import { batchIssueStocks } from "@/dal/inventory/get-requested-items";

type IncomingItem = MergedItemReturnTypeInventoryWithStore & {
  availableStock: number;
};

interface StoreTab {
  storeId: string;
  storeName: string;
}

interface ItemRequestClientProps {
  incoming: IncomingItem[];
  history: RequestedItemHistoryEntry[];
  storeTabs: StoreTab[];
}

const ALL_TAB = "__all__";

export function ItemRequestClient({
  incoming,
  history,
  storeTabs,
}: ItemRequestClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>(ALL_TAB);
  const [isIssuing, setIsIssuing] = useState(false);
  const [batchIssueModalOpen, setBatchIssueModalOpen] = useState(false);
  const [batchIssueNote, setBatchIssueNote] = useState("");

  const filteredIncoming = useMemo(() => {
    if (activeTab === ALL_TAB) return incoming;
    return incoming.filter((i) => i.storeId === activeTab);
  }, [incoming, activeTab]);

  const filteredHistory = useMemo(() => {
    if (activeTab === ALL_TAB) return history;
    return history.filter((h) => h.storeId === activeTab);
  }, [history, activeTab]);

  const getStatus = (entry: RequestedItemHistoryEntry) => {
    if (entry.isRequestApproved) {
      if (entry.deliveryStatus === "success") return "Delivered";
      if (entry.deliveryStatus === "on the way") return "On the way";
      return "Approved";
    }
    return "Rejected";
  };

  const statusClass = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-100 text-emerald-800";
      case "Approved":
        return "bg-blue-100 text-blue-800";
      case "On the way":
        return "bg-indigo-100 text-indigo-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-amber-100 text-amber-800";
    }
  };

  const incomingCountFor = (storeId: string) =>
    incoming.filter((i) => i.storeId === storeId).length;

  const handleBatchIssue = async (note: string) => {
    if (filteredIncoming.length === 0) {
      toast.warning("No incoming requests to issue.");
      return;
    }
    setIsIssuing(true);
    try {
      const ids = filteredIncoming.map((i) => i.id);
      const result = await batchIssueStocks(ids, note.trim() || "Batch issued");
      if (result.success) {
        toast.success(result.message);
        setBatchIssueModalOpen(false);
        setBatchIssueNote("");
        router.refresh();
      } else {
        toast.error(result.message);
        if (result.issuedCount != null && result.issuedCount > 0) {
          setBatchIssueModalOpen(false);
          setBatchIssueNote("");
          router.refresh();
        }
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsIssuing(false);
    }
  };

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="mb-2 text-2xl font-bold text-amber-900">
          Inventory MGT — Item Request
        </h1>
        <p className="text-amber-800/80">
          View all item requests per store, including incoming requests and
          decision history.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border border-amber-200 bg-white p-3">
        <button
          onClick={() => setActiveTab(ALL_TAB)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === ALL_TAB
              ? "bg-amber-600 text-white shadow-sm"
              : "text-amber-700 hover:bg-amber-100"
          }`}
        >
          All Branches
        </button>
        {storeTabs.map((tab) => {
          const count = incomingCountFor(tab.storeId);
          return (
            <button
              key={tab.storeId}
              onClick={() => setActiveTab(tab.storeId)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.storeId
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-amber-700 hover:bg-amber-100"
              }`}
            >
              {tab.storeName}
              {count > 0 && (
                <span
                  className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
                    activeTab === tab.storeId
                      ? "bg-white/25 text-white"
                      : "bg-amber-200 text-amber-800"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-amber-900">
            Incoming Requests
            <span className="ml-2 text-sm font-normal text-amber-600">
              ({filteredIncoming.length})
            </span>
          </h2>
          <button
            type="button"
            onClick={() => setBatchIssueModalOpen(true)}
            disabled={filteredIncoming.length === 0}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Batch issue stocks
          </button>
        </div>
        <div className="overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-max min-w-full table-auto text-left text-sm">
              <thead>
                <tr className="border-b border-amber-200 bg-amber-50">
                  <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                    Store
                  </th>
                  <th className="min-w-[140px] px-5 py-4 font-semibold text-amber-900">
                    Product
                  </th>
                  <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                    Qty
                  </th>
                  <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                    Unit
                  </th>
                  <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                    Account
                  </th>
                  <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                    Available Stock
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredIncoming.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-amber-700"
                    >
                      No incoming requests
                      {activeTab !== ALL_TAB ? " for this branch" : ""}.
                    </td>
                  </tr>
                ) : (
                  filteredIncoming.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-amber-100 hover:bg-amber-50/50"
                    >
                      <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                        {item.storeUsername}
                      </td>
                      <td className="min-w-[140px] px-5 py-3 text-amber-900">
                        {item.productNameGeneral}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                        {item.quantity}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                        {item.unitOfMeasurement}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                        {item.accountRecognition}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                        {item.availableStock}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-amber-900">
          History
          <span className="ml-2 text-sm font-normal text-amber-600">
            ({filteredHistory.length})
          </span>
        </h2>
        <div className="overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-max min-w-full table-auto text-left text-sm">
              <thead>
                <tr className="border-b border-amber-200 bg-amber-50">
                  <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                    Date
                  </th>
                  <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                    Store
                  </th>
                  <th className="min-w-[140px] px-5 py-4 font-semibold text-amber-900">
                    Product
                  </th>
                  <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                    Qty
                  </th>
                  <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                    Unit
                  </th>
                  <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                    Status
                  </th>
                  <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                    Delivery
                  </th>
                  <th className="min-w-[160px] px-5 py-4 font-semibold text-amber-900">
                    Note
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-12 text-center text-amber-700"
                    >
                      No history records
                      {activeTab !== ALL_TAB ? " for this branch" : ""}.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((entry) => {
                    const status = getStatus(entry);
                    return (
                      <tr
                        key={entry.id}
                        className="border-b border-amber-100 hover:bg-amber-50/50"
                      >
                        <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                          {entry.createdAt
                            ? new Date(entry.createdAt).toLocaleDateString(
                                undefined,
                                { dateStyle: "medium" },
                              )
                            : "—"}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                          {entry.storeUsername}
                        </td>
                        <td className="min-w-[140px] px-5 py-3 text-amber-900">
                          {entry.productNameGeneral}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                          {entry.quantity}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                          {entry.unitOfMeasurement}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3">
                          <span
                            className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${statusClass(
                              status,
                            )}`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                          {entry.deliveryStatus ? (
                            <span className="capitalize">
                              {entry.deliveryStatus}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="min-w-[160px] px-5 py-3 text-amber-900">
                          {entry.note ?? "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {batchIssueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-amber-200 bg-amber-50">
              <h3 className="text-base font-bold text-amber-900">Batch issue stocks</h3>
              <p className="text-xs text-amber-600 mt-0.5">
                {filteredIncoming.length} item{filteredIncoming.length !== 1 ? "s" : ""} will be issued. Add a note (optional).
              </p>
            </div>
            <div className="px-6 py-5">
              <label htmlFor="batch-issue-note" className="text-xs font-semibold text-amber-900">
                Note
              </label>
              <textarea
                id="batch-issue-note"
                rows={3}
                value={batchIssueNote}
                onChange={(e) => setBatchIssueNote(e.target.value)}
                placeholder="e.g. Batch issued for delivery"
                className="mt-1.5 w-full rounded-lg border border-amber-200 px-3 py-2 text-sm text-amber-900 placeholder:text-amber-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
              />
            </div>
            <div className="px-6 py-4 border-t border-amber-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!isIssuing) {
                    setBatchIssueModalOpen(false);
                    setBatchIssueNote("");
                  }
                }}
                disabled={isIssuing}
                className="rounded-lg border border-amber-200 bg-white px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleBatchIssue(batchIssueNote)}
                disabled={isIssuing}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 transition-colors disabled:opacity-50"
              >
                {isIssuing ? "Issuing…" : "Issue stocks"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
