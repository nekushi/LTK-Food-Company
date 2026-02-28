"use client";

import { useState, useEffect, useMemo } from "react";
import { FiSearch, FiUsers } from "react-icons/fi";
import { getEmployees } from "@/app/hr/employees/dal/get-employees";
import { getAuth } from "@/lib/auth-storage";

type EmployeeRow = {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string | null;
  branch: string | null;
  employeeData: {
    dateHired?: Date;
    contactNo?: string | null;
  } | null;
};

export default function StoreEmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [nameFilter, setNameFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const filteredEmployees = useMemo(() => {
    let list = employees;
    const name = nameFilter.trim().toLowerCase();
    if (name) {
      list = list.filter(
        (e) =>
          `${e.firstName} ${e.lastName}`.toLowerCase().includes(name) ||
          `${e.lastName} ${e.firstName}`.toLowerCase().includes(name),
      );
    }
    return list;
  }, [employees, nameFilter]);

  useEffect(() => {
    const storeName = getAuth("username") || "";

    getEmployees().then((all) => {
      const filtered = storeName
        ? (all as EmployeeRow[]).filter((e) => {
            if (!e.branch) return false;
            const branchLower = e.branch.toLowerCase();
            const storeLower = storeName.toLowerCase();
            return (
              storeLower.includes(branchLower) ||
              branchLower.includes(storeLower)
            );
          })
        : (all as EmployeeRow[]);
      setEmployees(filtered);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
          <FiUsers className="text-amber-700" />
          Employees
        </h1>
        <p className="text-sm text-amber-700/80 mt-1">
          {employees.length} employee{employees.length !== 1 ? "s" : ""} in this
          branch
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <FiSearch className="text-amber-600" />
          <label
            htmlFor="filter-name"
            className="text-xs font-semibold text-amber-900"
          >
            Name
          </label>
        </div>
        <input
          id="filter-name"
          type="text"
          placeholder="Search by name..."
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="rounded-lg border border-amber-200 px-3 py-2 text-sm text-amber-900 placeholder:text-amber-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 w-48"
        />
      </div>

      {employees.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-12 text-center flex flex-col items-center">
          <FiUsers className="text-4xl text-amber-300 mb-4" />
          <h3 className="text-lg font-medium text-amber-900 mb-1">
            No Employees
          </h3>
          <p className="text-amber-700/80 text-sm">
            No employees found for this branch.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] table-auto text-left text-sm">
              <thead>
                <tr className="border-b border-amber-200 bg-amber-50">
                  <th className="whitespace-nowrap px-5 py-3.5 font-semibold text-amber-900 text-xs uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="whitespace-nowrap px-5 py-3.5 font-semibold text-amber-900 text-xs uppercase tracking-wider">
                    ID
                  </th>
                  <th className="whitespace-nowrap px-5 py-3.5 font-semibold text-amber-900 text-xs uppercase tracking-wider">
                    Branch
                  </th>
                  <th className="whitespace-nowrap px-5 py-3.5 font-semibold text-amber-900 text-xs uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="whitespace-nowrap px-5 py-3.5 font-semibold text-amber-900 text-xs uppercase tracking-wider">
                    Date Hired
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {filteredEmployees.map((row) => {
                  const initials =
                    `${row.firstName?.[0] ?? ""}${row.lastName?.[0] ?? ""}`.toUpperCase() ||
                    "??";
                  const dateHired = row.employeeData?.dateHired
                    ? new Date(row.employeeData.dateHired).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )
                    : null;

                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-amber-50/50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-amber-700 text-white size-9 flex items-center justify-center text-xs font-bold shrink-0">
                            {initials}
                          </div>
                          <p className="text-sm font-semibold text-amber-900 truncate">
                            {row.lastName}, {row.firstName}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {row.employeeId ? (
                          <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                            {row.employeeId}
                          </span>
                        ) : (
                          <span className="text-xs text-amber-400 italic">
                            N/A
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-sm ${row.branch ? "text-amber-900" : "text-amber-400 italic"}`}
                        >
                          {row.branch || "N/A"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-sm ${
                            row.employeeData?.contactNo
                              ? "text-amber-900"
                              : "text-amber-400 italic"
                          }`}
                        >
                          {row.employeeData?.contactNo || "N/A"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-sm ${dateHired ? "text-amber-900" : "text-amber-400 italic"}`}
                        >
                          {dateHired || "N/A"}
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
  );
}
