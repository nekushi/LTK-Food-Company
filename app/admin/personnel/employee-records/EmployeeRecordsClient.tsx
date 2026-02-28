"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { FiUsers, FiSearch } from "react-icons/fi";
import AddEmployeeModal from "./AddEmployeeModal";

type EmployeeRow = {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string | null;
  branch: string | null;
  employeeData: {
    dateHired?: Date;
    contactNo?: string | null;
    email?: string | null;
    sss?: string | null;
    philhealth?: string | null;
    pagIbig?: string | null;
  } | null;
};

interface EmployeeRecordsClientProps {
  employees: EmployeeRow[];
}

export default function EmployeeRecordsClient({ employees }: EmployeeRecordsClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [nameFilter, setNameFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");

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
    const branch = branchFilter.trim().toLowerCase();
    if (branch) {
      list = list.filter(
        (e) => e.branch?.toLowerCase().includes(branch),
      );
    }
    return list;
  }, [employees, nameFilter, branchFilter]);

  const branchOptions = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => {
      if (e.branch?.trim()) set.add(e.branch.trim());
    });
    return Array.from(set).sort();
  }, [employees]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
            <FiUsers className="text-amber-700" />
            Employee Records
          </h1>
          <p className="text-sm text-amber-700/80 mt-1">
            {filteredEmployees.length} of {employees.length} employee{employees.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-800 transition-colors"
        >
          Add Employee
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-amber-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <FiSearch className="text-amber-600" />
          <label htmlFor="filter-name" className="text-xs font-semibold text-amber-900">
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
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-amber-900">Branch</span>
          <select
            id="filter-branch"
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="rounded-lg border border-amber-200 px-3 py-2 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 min-w-[120px]"
          >
            <option value="">All branches</option>
            {branchOptions.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
        {(nameFilter || branchFilter) && (
          <button
            type="button"
            onClick={() => {
              setNameFilter("");
              setBranchFilter("");
            }}
            className="text-xs font-medium text-amber-600 hover:text-amber-800 underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <AddEmployeeModal open={modalOpen} onClose={() => setModalOpen(false)} />

      {employees.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-12 text-center flex flex-col items-center">
          <FiUsers className="text-4xl text-amber-300 mb-4" />
          <h3 className="text-lg font-medium text-amber-900 mb-1">No Employees Yet</h3>
          <p className="text-amber-700/80 text-sm">Add your first employee to get started.</p>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-12 text-center flex flex-col items-center">
          <FiUsers className="text-4xl text-amber-300 mb-4" />
          <h3 className="text-lg font-medium text-amber-900 mb-1">No matches</h3>
          <p className="text-amber-700/80 text-sm">No employees match the current filters.</p>
          <button
            type="button"
            onClick={() => {
              setNameFilter("");
              setBranchFilter("");
            }}
            className="mt-3 text-sm font-medium text-amber-700 hover:text-amber-900 underline"
          >
            Clear filters
          </button>
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
                  <th className="whitespace-nowrap px-5 py-3.5 font-semibold text-amber-900 text-xs uppercase tracking-wider">
                    SSS
                  </th>
                  <th className="whitespace-nowrap px-5 py-3.5 font-semibold text-amber-900 text-xs uppercase tracking-wider">
                    PhilHealth
                  </th>
                  <th className="whitespace-nowrap px-5 py-3.5 font-semibold text-amber-900 text-xs uppercase tracking-wider">
                    Pag-IBIG
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {filteredEmployees.map((row) => {
                  const initials = `${row.firstName?.[0] ?? ""}${row.lastName?.[0] ?? ""}`.toUpperCase() || "??";
                  const dateHired = row.employeeData?.dateHired
                    ? new Date(row.employeeData.dateHired).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : null;

                  return (
                    <tr key={row.id} className="group hover:bg-amber-50/50 transition-colors cursor-pointer">
                      <td className="px-5 py-3.5">
                        <Link href={`/admin/personnel/employee-records/${row.id}`} className="flex items-center gap-3">
                          <div className="rounded-full bg-amber-700 text-white size-9 flex items-center justify-center text-xs font-bold shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-amber-900 truncate">
                              {row.lastName}, {row.firstName}
                            </p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link href={`/admin/personnel/employee-records/${row.id}`} className="block">
                          {row.employeeId ? (
                            <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                              {row.employeeId}
                            </span>
                          ) : (
                            <span className="text-xs text-amber-400 italic">N/A</span>
                          )}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link href={`/admin/personnel/employee-records/${row.id}`} className="block">
                          <span className={`text-sm ${row.branch ? "text-amber-900" : "text-amber-400 italic"}`}>
                            {row.branch || "N/A"}
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link href={`/admin/personnel/employee-records/${row.id}`} className="block">
                          <span
                            className={`text-sm ${
                              row.employeeData?.contactNo ? "text-amber-900" : "text-amber-400 italic"
                            }`}
                          >
                            {row.employeeData?.contactNo || "N/A"}
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link href={`/admin/personnel/employee-records/${row.id}`} className="block">
                          <span className={`text-sm ${dateHired ? "text-amber-900" : "text-amber-400 italic"}`}>
                            {dateHired || "N/A"}
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link href={`/admin/personnel/employee-records/${row.id}`} className="block">
                          <span
                            className={`text-sm ${
                              row.employeeData?.sss ? "text-amber-900" : "text-amber-400 italic"
                            }`}
                          >
                            {row.employeeData?.sss || "N/A"}
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link href={`/admin/personnel/employee-records/${row.id}`} className="block">
                          <span
                            className={`text-sm ${
                              row.employeeData?.philhealth ? "text-amber-900" : "text-amber-400 italic"
                            }`}
                          >
                            {row.employeeData?.philhealth || "N/A"}
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link href={`/admin/personnel/employee-records/${row.id}`} className="block">
                          <span
                            className={`text-sm ${
                              row.employeeData?.pagIbig ? "text-amber-900" : "text-amber-400 italic"
                            }`}
                          >
                            {row.employeeData?.pagIbig || "N/A"}
                          </span>
                        </Link>
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
