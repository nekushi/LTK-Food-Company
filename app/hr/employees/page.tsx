export const dynamic = "force-dynamic";

import Link from "next/link";
import { FiPlus, FiUsers } from "react-icons/fi";
import { getEmployees } from "./dal/get-employees";

export default async function HREmployeesPage() {
  const employees = await getEmployees();

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
            <FiUsers className="text-amber-700" />
            Employees
          </h1>
          <p className="text-sm text-amber-700/80 mt-1">
            {employees.length} employee{employees.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <Link
          href="/hr/employees/create-employee"
          className="flex items-center gap-2 rounded-lg bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-800 transition-colors"
        >
          <FiPlus className="text-base" />
          Add Employee
        </Link>
      </div>

      {/* Table */}
      {employees.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-12 text-center flex flex-col items-center">
          <FiUsers className="text-4xl text-amber-300 mb-4" />
          <h3 className="text-lg font-medium text-amber-900 mb-1">No Employees Yet</h3>
          <p className="text-amber-700/80 text-sm">Add your first employee to get started.</p>
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
                    Contact
                  </th>
                  <th className="whitespace-nowrap px-5 py-3.5 font-semibold text-amber-900 text-xs uppercase tracking-wider">
                    Email
                  </th>
                  <th className="whitespace-nowrap px-5 py-3.5 font-semibold text-amber-900 text-xs uppercase tracking-wider">
                    Date Hired
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {employees.map((row) => {
                  const initials = `${row.firstName?.[0] ?? ""}${row.lastName?.[0] ?? ""}`.toUpperCase() || "??";
                  const dateHired = row.employeeData?.dateHired
                    ? new Date(row.employeeData.dateHired).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                    : null;

                  return (
                    <tr key={row.id} className="group hover:bg-amber-50/50 transition-colors cursor-pointer">
                      <td className="px-5 py-3.5">
                        <Link href={`/hr/employees/${row.id}`} className="flex items-center gap-3">
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
                        <Link href={`/hr/employees/${row.id}`} className="block">
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
                        <Link href={`/hr/employees/${row.id}`} className="block">
                          <span className={`text-sm ${row.employeeData?.contactNo ? "text-amber-900" : "text-amber-400 italic"}`}>
                            {row.employeeData?.contactNo || "N/A"}
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link href={`/hr/employees/${row.id}`} className="block">
                          <span className={`text-sm ${row.employeeData?.email ? "text-amber-900" : "text-amber-400 italic"}`}>
                            {row.employeeData?.email || "N/A"}
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link href={`/hr/employees/${row.id}`} className="block">
                          <span className={`text-sm ${dateHired ? "text-amber-900" : "text-amber-400 italic"}`}>
                            {dateHired || "N/A"}
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
