"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { FiSearch, FiChevronRight, FiUsers, FiX } from "react-icons/fi";

interface Account {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
}

const ROLE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  ADMIN: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
  HR: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  INVENTORY: { bg: "bg-teal-50", text: "text-teal-700", dot: "bg-teal-500" },
  STORE: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  DELIVERY: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
};

const ROLES = ["All", "ADMIN", "HR", "INVENTORY", "STORE", "DELIVERY"];

export default function AccountsClient({ accounts }: { accounts: Account[] }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const filtered = useMemo(() => {
    let result = accounts;

    if (roleFilter !== "All") {
      result = result.filter((a) => a.role === roleFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.firstName.toLowerCase().includes(q) ||
          a.lastName.toLowerCase().includes(q) ||
          a.username.toLowerCase().includes(q) ||
          `${a.firstName} ${a.lastName}`.toLowerCase().includes(q)
      );
    }

    return result;
  }, [accounts, search, roleFilter]);

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = { All: accounts.length };
    for (const a of accounts) {
      counts[a.role] = (counts[a.role] ?? 0) + 1;
    }
    return counts;
  }, [accounts]);

  const METRIC_ROLES = ["ADMIN", "HR", "INVENTORY", "STORE", "DELIVERY"] as const;

  return (
    <div className="space-y-5">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setRoleFilter("All")}
          className={`rounded-xl border p-4 text-left transition-all ${
            roleFilter === "All"
              ? "border-amber-400 bg-amber-50 shadow-sm ring-1 ring-amber-300"
              : "border-amber-200 bg-white hover:border-amber-300 hover:shadow-sm"
          }`}
        >
          <p className="text-2xl font-bold text-amber-900">{accounts.length}</p>
          <p className="text-[11px] font-medium text-amber-600 mt-1">All Accounts</p>
        </button>
        {METRIC_ROLES.map((role) => {
          const style = ROLE_COLORS[role];
          const count = roleCounts[role] ?? 0;
          const isActive = roleFilter === role;
          return (
            <button
              key={role}
              onClick={() => setRoleFilter(isActive ? "All" : role)}
              className={`rounded-xl border p-4 text-left transition-all ${
                isActive
                  ? `${style.bg} border-current shadow-sm ring-1 ${style.text}`
                  : "border-amber-200 bg-white hover:border-amber-300 hover:shadow-sm"
              }`}
            >
              <p className={`text-2xl font-bold ${isActive ? style.text : "text-amber-900"}`}>{count}</p>
              <p className={`text-[11px] font-medium mt-1 flex items-center gap-1.5 ${isActive ? style.text : "text-amber-600"}`}>
                <span className={`size-1.5 rounded-full ${style.dot}`} />
                {role}
              </p>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
          <input
            type="text"
            placeholder="Search by name or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-amber-200 bg-white pl-10 pr-9 py-2.5 text-sm text-amber-900 placeholder:text-amber-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 hover:text-amber-700 transition-colors"
            >
              <FiX />
            </button>
          )}
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-amber-200 bg-white px-3 py-2.5 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 sm:w-48"
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role === "All" ? "All Roles" : role}
            </option>
          ))}
        </select>
      </div>

      {/* Results Count */}
      <p className="text-xs text-amber-600">
        Showing {filtered.length} of {accounts.length} account{accounts.length !== 1 ? "s" : ""}
        {roleFilter !== "All" && <span className="ml-1 font-medium">&bull; {roleFilter}</span>}
        {search.trim() && <span className="ml-1 font-medium">&bull; &quot;{search.trim()}&quot;</span>}
      </p>

      {/* Account Cards */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-12 text-center flex flex-col items-center">
          <FiUsers className="text-4xl text-amber-300 mb-4" />
          <h3 className="text-lg font-medium text-amber-900 mb-1">No Accounts Found</h3>
          <p className="text-amber-700/80 text-sm">
            {search.trim() ? "Try adjusting your search or filter." : "No accounts match the selected filter."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((account) => {
            const roleStyle = ROLE_COLORS[account.role] ?? { bg: "bg-gray-50", text: "text-gray-700", dot: "bg-gray-500" };
            const initials = `${account.firstName?.[0] ?? ""}${account.lastName?.[0] ?? ""}`.toUpperCase() || "??";

            return (
              <Link
                key={account.id}
                href={`/hr/accounts/${account.id}`}
                className="group flex items-center gap-4 rounded-xl border border-amber-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-amber-300 transition-all"
              >
                <div className="rounded-full bg-amber-700 text-white size-12 flex items-center justify-center text-sm font-bold shrink-0">
                  {initials}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-amber-900 truncate">
                    {account.firstName} {account.lastName}
                  </p>
                  <p className="text-xs text-amber-600 truncate">@{account.username}</p>
                  <div className="mt-2">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${roleStyle.bg} ${roleStyle.text}`}>
                      <span className={`size-1.5 rounded-full ${roleStyle.dot}`} />
                      {account.role}
                    </span>
                  </div>
                </div>

                <FiChevronRight className="text-amber-400 group-hover:text-amber-600 transition-colors shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
