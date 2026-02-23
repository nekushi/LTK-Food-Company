import { getEmployeeProfile } from "../dal/get-employee-profile";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default async function EmployeeProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  console.log(id);

  const employee = await getEmployeeProfile(id);

  if (!employee) {
    notFound();
  }

  const { employeeData, employeeWorkData } = employee;

  return (
    <div className="space-y-6 p-8">
      <button className="underline underline-offset cursor-pointer mb-4 hover:text-amber-600">
        <Link href={"/hr/employees"} className="flex items-center gap-1">
          <FaArrowLeft className="text-xs underline" />
          back to employees
        </Link>
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-amber-900">
            {employee.firstName} {employee.lastName}
          </h1>
          <p className="text-amber-700">
            Employee ID: {employee.employeeId || "Not assigned"}
          </p>
        </div>
        <div className="text-sm text-amber-800">
          <p>
            <span className="font-semibold">Date Hired: </span>
            {employeeData?.dateHired
              ? new Date(employeeData.dateHired).toLocaleDateString()
              : "N/A"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information Card */}
        <div className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-amber-900 border-b border-amber-100 pb-2">
            Contact Information
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-amber-700">Email:</span>
              <span className="font-medium text-amber-900">
                {employeeData?.email || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-700">Contact Number:</span>
              <span className="font-medium text-amber-900">
                {employeeData?.contactNo || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-700">Address:</span>
              <span className="font-medium text-amber-900">
                {employeeData?.address || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Government Numbers Card */}
        <div className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-amber-900 border-b border-amber-100 pb-2">
            Government IDs
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-amber-700">SSS Number:</span>
              <span className="font-medium text-amber-900">
                {employeeData?.sss || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-700">Pag-IBIG Number:</span>
              <span className="font-medium text-amber-900">
                {employeeData?.pagIbig || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-700">PhilHealth:</span>
              <span className="font-medium text-amber-900">
                {employeeData?.philhealth || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-700">TIN:</span>
              <span className="font-medium text-amber-900">
                {employeeData?.tin || "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Work Data Payload */}
      <div className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-amber-900 border-b border-amber-100 pb-2">
          Work Data (JSON Payload)
        </h2>
        <div className="rounded-md bg-amber-50 p-4 font-mono text-sm text-amber-800 overflow-x-auto">
          {employeeWorkData?.data ? (
            <pre>{JSON.stringify(employeeWorkData.data, null, 2)}</pre>
          ) : (
            <p className="text-amber-600/60 italic">
              No work data payload available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
