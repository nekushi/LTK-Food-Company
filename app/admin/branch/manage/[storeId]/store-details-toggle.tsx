"use client";

import { useState } from "react";
import { FiMapPin, FiUser, FiChevronDown, FiChevronUp } from "react-icons/fi";

export default function StoreDetailsToggle({
  locationText,
  managedBy,
}: {
  locationText: string;
  managedBy: string;
}) {
  const [visible, setVisible] = useState(true);

  return (
    <div className="rounded-xl border border-amber-200 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setVisible((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-amber-50/50"
      >
        <h2 className="text-lg font-bold text-amber-900">Store details</h2>
        <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
          {visible ? "Hide" : "Show"}
          {visible ? <FiChevronUp className="text-sm" /> : <FiChevronDown className="text-sm" />}
        </span>
      </button>
      {visible && (
        <div className="border-t border-amber-100 px-6 pb-5 pt-4">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="flex items-center gap-2 text-sm font-medium text-amber-700">
                <FiMapPin className="text-amber-600" />
                Location
              </dt>
              <dd className="mt-1 text-amber-900">{locationText}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 text-sm font-medium text-amber-700">
                <FiUser className="text-amber-600" />
                Managed by
              </dt>
              <dd className="mt-1 text-amber-900">{managedBy}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
