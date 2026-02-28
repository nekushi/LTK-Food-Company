"use client";

import { useState, useMemo } from "react";
import {
  FiBox,
  FiClock,
  FiCheckCircle,
  FiAlertTriangle,
  FiAlertCircle,
} from "react-icons/fi";

interface MergedInventory {
  productName: string;
  accountRecognition: string;
  unitOfMeasurement: string;
  quantity: number;
  netPay: number;
}

interface RequestItem {
  id: string;
  productNameSpecific: string;
  isRequestApproved: boolean;
  quantity: number;
  unitOfMeasurement: string;
  createdAt: string;
}

interface InventoryReportItem {
  id: string;
  reportType: string;
  periodMonth: string;
  periodYear: string;
  productName: string;
  accountRecognition: string;
  unitOfMeasurement: string;
  quantity: number;
  itemsUsed: number;
  itemsLeft: number;
  createdAt: string;
}

function getStockStatus(qty: number) {
  if (qty <= 0) return { label: "Out of Stock", color: "bg-red-100 text-red-700 border-red-200" };
  if (qty <= 5) return { label: "Critical", color: "bg-red-50 text-red-600 border-red-200" };
  if (qty <= 15) return { label: "Low Stock", color: "bg-amber-50 text-amber-700 border-amber-200" };
  if (qty <= 50) return { label: "Good", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  return { label: "Well Stocked", color: "bg-blue-50 text-blue-700 border-blue-200" };
}

const DRY_KEYWORDS = ["operational", "office", "janitorial", "marketing", "dry"];
const RAW_KEYWORDS = ["food", "raw"];

function isDryCategory(accountRecognition: string): boolean {
  const lower = (accountRecognition || "").toLowerCase();
  return DRY_KEYWORDS.some((k) => lower.includes(k));
}

function isRawCategory(accountRecognition: string): boolean {
  const lower = (accountRecognition || "").toLowerCase();
  return RAW_KEYWORDS.some((k) => lower.includes(k));
}

const TABS = [
  { value: "dry", label: "Dry Items", icon: FiBox },
  { value: "raw", label: "Raw Materials", icon: FiBox },
  { value: "requests", label: "Request History", icon: FiClock },
] as const;

type TabValue = (typeof TABS)[number]["value"];

export default function StoreTabs({
  mergedInventory,
  lowStockCount,
  outOfStockCount,
  requestHistory,
  inventoryReports = [],
}: {
  mergedInventory: MergedInventory[];
  lowStockCount: number;
  outOfStockCount: number;
  requestHistory: RequestItem[];
  inventoryReports?: InventoryReportItem[];
}) {
  const [activeTab, setActiveTab] = useState<TabValue>("dry");

  const dryInventory = useMemo(
    () => mergedInventory.filter((i) => isDryCategory(i.accountRecognition)),
    [mergedInventory],
  );
  const rawInventory = useMemo(
    () => mergedInventory.filter((i) => isRawCategory(i.accountRecognition)),
    [mergedInventory],
  );
  const dryReports = useMemo(
    () => (inventoryReports || []).filter((r) => isDryCategory(r.accountRecognition)),
    [inventoryReports],
  );
  const rawReports = useMemo(
    () => (inventoryReports || []).filter((r) => isRawCategory(r.accountRecognition)),
    [inventoryReports],
  );

  const dryLowStock = dryInventory.filter((i) => i.quantity > 0 && i.quantity <= 15).length;
  const dryOutOfStock = dryInventory.filter((i) => i.quantity <= 0).length;
  const rawLowStock = rawInventory.filter((i) => i.quantity > 0 && i.quantity <= 15).length;
  const rawOutOfStock = rawInventory.filter((i) => i.quantity <= 0).length;

  return (
    <div className="rounded-xl border border-amber-200 bg-white shadow-sm">
      {/* Tab Header */}
      <div className="flex border-b border-amber-200">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${
                isActive
                  ? "text-amber-900 border-b-2 border-amber-700 bg-amber-50/50"
                  : "text-amber-600 hover:text-amber-800 hover:bg-amber-50/30"
              }`}
            >
              <Icon className="text-base" />
              {tab.label}
              {tab.value === "dry" && (dryInventory.length > 0 || dryReports.length > 0) && (
                <span className="text-[10px] font-medium bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full border border-amber-200">
                  {dryInventory.length + dryReports.length}
                </span>
              )}
              {tab.value === "raw" && (rawInventory.length > 0 || rawReports.length > 0) && (
                <span className="text-[10px] font-medium bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full border border-amber-200">
                  {rawInventory.length + rawReports.length}
                </span>
              )}
              {tab.value === "requests" && requestHistory.length > 0 && (
                <span className="text-[10px] font-medium bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full border border-amber-200">
                  {requestHistory.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "dry" && (
          <div className="space-y-6">
            {(dryLowStock > 0 || dryOutOfStock > 0) && (
              <div className="flex gap-2">
                {dryOutOfStock > 0 && (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-200">
                    <FiAlertCircle className="text-sm" />
                    {dryOutOfStock} out of stock
                  </div>
                )}
                {dryLowStock > 0 && (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200">
                    <FiAlertTriangle className="text-sm" />
                    {dryLowStock} low stock
                  </div>
                )}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {dryInventory.length > 0 ? (
                dryInventory.map((item) => {
                  const status = getStockStatus(item.quantity);
                  return (
                    <div
                      key={item.productName}
                      className="rounded-lg border border-amber-100 p-3 hover:bg-amber-50/40 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <div className="min-w-0 flex-1 mr-2">
                          <h4 className="text-sm font-semibold text-amber-900 truncate">
                            {item.productName}
                          </h4>
                          <p className="text-[11px] text-amber-600/70 mt-0.5">
                            {item.accountRecognition}
                          </p>
                        </div>
                        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-xs text-amber-600">
                          ₱{item.netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })} net
                        </span>
                        <div className="text-right">
                          <span className="text-sm font-bold text-amber-900">
                            {item.quantity}
                          </span>
                          <span className="text-xs text-amber-700 ml-1">
                            {item.unitOfMeasurement}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full">
                  <p className="text-sm text-amber-600/70 italic text-center py-4">
                    No dry items (operational, office, janitorial, marketing supplies) linked yet.
                  </p>
                </div>
              )}
            </div>
            {dryReports.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-amber-900 mb-2">Inventory Report</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-amber-200 text-amber-900">
                      <tr>
                        <th className="py-2 px-2 font-semibold">Product</th>
                        <th className="py-2 px-2 font-semibold">Category</th>
                        <th className="py-2 px-2 font-semibold">Period</th>
                        <th className="py-2 px-2 font-semibold text-center">Qty</th>
                        <th className="py-2 px-2 font-semibold text-center">Used</th>
                        <th className="py-2 px-2 font-semibold text-center">Left</th>
                        <th className="py-2 px-2 font-semibold text-right">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100">
                      {dryReports.map((r) => {
                        const usagePercent = r.quantity > 0 ? (r.itemsUsed / r.quantity) * 100 : 0;
                        return (
                          <tr key={r.id} className="hover:bg-amber-50/40">
                            <td className="py-2 px-2 text-amber-900 font-medium">
                              {r.productName}
                              <span className="text-[11px] text-amber-500 ml-1">({r.unitOfMeasurement})</span>
                            </td>
                            <td className="py-2 px-2 text-amber-700 text-xs">{r.accountRecognition}</td>
                            <td className="py-2 px-2 text-amber-700 text-xs">{r.periodMonth} {r.periodYear}</td>
                            <td className="py-2 px-2 text-center text-amber-900 font-medium">{r.quantity}</td>
                            <td className="py-2 px-2 text-center">
                              <span className={`font-medium ${usagePercent > 80 ? "text-red-600" : usagePercent > 50 ? "text-amber-600" : "text-emerald-600"}`}>
                                {r.itemsUsed}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-center">
                              <span className={`font-medium ${r.itemsLeft <= 5 ? "text-red-600" : r.itemsLeft <= 15 ? "text-amber-600" : "text-emerald-600"}`}>
                                {r.itemsLeft}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-right">
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                {r.reportType}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "raw" && (
          <div className="space-y-6">
            {(rawLowStock > 0 || rawOutOfStock > 0) && (
              <div className="flex gap-2">
                {rawOutOfStock > 0 && (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-200">
                    <FiAlertCircle className="text-sm" />
                    {rawOutOfStock} out of stock
                  </div>
                )}
                {rawLowStock > 0 && (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200">
                    <FiAlertTriangle className="text-sm" />
                    {rawLowStock} low stock
                  </div>
                )}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {rawInventory.length > 0 ? (
                rawInventory.map((item) => {
                  const status = getStockStatus(item.quantity);
                  return (
                    <div
                      key={item.productName}
                      className="rounded-lg border border-amber-100 p-3 hover:bg-amber-50/40 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <div className="min-w-0 flex-1 mr-2">
                          <h4 className="text-sm font-semibold text-amber-900 truncate">
                            {item.productName}
                          </h4>
                          <p className="text-[11px] text-amber-600/70 mt-0.5">
                            {item.accountRecognition}
                          </p>
                        </div>
                        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-xs text-amber-600">
                          ₱{item.netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })} net
                        </span>
                        <div className="text-right">
                          <span className="text-sm font-bold text-amber-900">
                            {item.quantity}
                          </span>
                          <span className="text-xs text-amber-700 ml-1">
                            {item.unitOfMeasurement}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full">
                  <p className="text-sm text-amber-600/70 italic text-center py-4">
                    No raw materials (food supplies) linked yet.
                  </p>
                </div>
              )}
            </div>
            {rawReports.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-amber-900 mb-2">Inventory Report</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-amber-200 text-amber-900">
                      <tr>
                        <th className="py-2 px-2 font-semibold">Product</th>
                        <th className="py-2 px-2 font-semibold">Category</th>
                        <th className="py-2 px-2 font-semibold">Period</th>
                        <th className="py-2 px-2 font-semibold text-center">Qty</th>
                        <th className="py-2 px-2 font-semibold text-center">Used</th>
                        <th className="py-2 px-2 font-semibold text-center">Left</th>
                        <th className="py-2 px-2 font-semibold text-right">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100">
                      {rawReports.map((r) => {
                        const usagePercent = r.quantity > 0 ? (r.itemsUsed / r.quantity) * 100 : 0;
                        return (
                          <tr key={r.id} className="hover:bg-amber-50/40">
                            <td className="py-2 px-2 text-amber-900 font-medium">
                              {r.productName}
                              <span className="text-[11px] text-amber-500 ml-1">({r.unitOfMeasurement})</span>
                            </td>
                            <td className="py-2 px-2 text-amber-700 text-xs">{r.accountRecognition}</td>
                            <td className="py-2 px-2 text-amber-700 text-xs">{r.periodMonth} {r.periodYear}</td>
                            <td className="py-2 px-2 text-center text-amber-900 font-medium">{r.quantity}</td>
                            <td className="py-2 px-2 text-center">
                              <span className={`font-medium ${usagePercent > 80 ? "text-red-600" : usagePercent > 50 ? "text-amber-600" : "text-emerald-600"}`}>
                                {r.itemsUsed}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-center">
                              <span className={`font-medium ${r.itemsLeft <= 5 ? "text-red-600" : r.itemsLeft <= 15 ? "text-amber-600" : "text-emerald-600"}`}>
                                {r.itemsLeft}
                              </span>
                            </td>
                            <td className="py-2 px-2 text-right">
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                {r.reportType}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "requests" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {requestHistory.length > 0 ? (
              requestHistory.map((req) => (
                <div
                  key={req.id}
                  className="group border border-amber-100 rounded-lg p-3 hover:bg-amber-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-semibold text-amber-900 group-hover:text-amber-700 transition-colors truncate mr-2">
                      {req.productNameSpecific}
                    </h4>
                    {req.isRequestApproved ? (
                      <span className="flex items-center gap-1 shrink-0 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <FiCheckCircle /> Approved
                      </span>
                    ) : (
                      <span className="shrink-0 text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                        Pending
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-end mt-2">
                    <p className="text-xs text-amber-600">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs font-medium text-amber-800">
                      Qty: {req.quantity} {req.unitOfMeasurement}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full">
                <p className="text-sm text-amber-600/70 italic text-center py-8">
                  No requests made yet.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
