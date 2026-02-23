import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import { getEmployees } from "./dal/get-employees";

export default async function HREmployeesPage() {
  const employees = await getEmployees();

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-xl font-semibold text-amber-900">Employees</h1>
      <button className="underline underline-offset cursor-pointer mb-4 hover:text-green-600">
        <Link
          href={"/hr/employees/create-employee"}
          className="flex items-center gap-1"
        >
          Create employee
          <FaArrowRight className="text-xs underline" />
        </Link>
      </button>

      <div className="overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-max min-w-full table-auto text-left text-sm">
            <thead>
              <tr className="border-b border-amber-200 bg-amber-50">
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  Employee ID
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  Name
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  Contact
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  Email
                </th>
              </tr>
            </thead>
            <tbody>
              {employees.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-amber-100 hover:bg-amber-50/50 cursor-pointer transition-colors"
                >
                  <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                    <Link
                      href={`/hr/employees/${row.id}`}
                      className="block w-full h-full"
                    >
                      {row.employeeId || "—"}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                    <Link
                      href={`/hr/employees/${row.id}`}
                      className="block w-full h-full"
                    >
                      {row.lastName}, {row.firstName}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                    <Link
                      href={`/hr/employees/${row.id}`}
                      className="block w-full h-full"
                    >
                      {row.employeeData?.contactNo || "—"}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                    <Link
                      href={`/hr/employees/${row.id}`}
                      className="block w-full h-full"
                    >
                      {row.employeeData?.email || "—"}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                    <Link
                      href={`/hr/employees/${row.id}`}
                      className="border block w-fit px-4 py-2 rounded-sm font-medium bg-amber-300 hover:bg-amber-400 active:bg-amber-500 transition"
                    >
                      <FaArrowRight />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
