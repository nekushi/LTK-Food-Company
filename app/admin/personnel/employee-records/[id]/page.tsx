export const dynamic = "force-dynamic";

import { getEmployeeProfile } from "@/app/hr/employees/dal/get-employee-profile";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import EmployeeSchedulesCard from "./employee-schedules-card";
import ProfileEditClient from "./profile-edit-client";

export default async function AdminEmployeeRecordProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const employee = await getEmployeeProfile(id);

  if (!employee) {
    notFound();
  }

  const { employeeData, employeeWorkData } = employee;

  return (
    <div className="space-y-6 p-8">
      <button className="underline underline-offset cursor-pointer mb-4 hover:text-amber-600">
        <Link
          href="/admin/personnel/employee-records"
          className="flex items-center gap-1"
        >
          <FaArrowLeft className="text-xs underline" />
          back to employee records
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
      </div>

      <ProfileEditClient
        employeeId={employee.id}
        firstName={employee.firstName}
        lastName={employee.lastName}
        employeeIdDisplay={employee.employeeId}
        employeeData={employeeData ?? null}
      />

      <div className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-amber-900 border-b border-amber-100 pb-2">
          Schedules (Work Data)
        </h2>
        {employeeWorkData?.data ? (
          <EmployeeSchedulesCard
            dataItems={employeeWorkData.data as unknown[]}
            deductionEligibility={{
              hasSss: Boolean(employeeData?.sss?.trim()),
              hasPagIbig: Boolean(employeeData?.pagIbig?.trim()),
              hasPhilhealth: Boolean(employeeData?.philhealth?.trim()),
            }}
            employeeName={`${employee.firstName} ${employee.lastName}`.trim()}
            employeeIdDisplay={employee.employeeId ?? undefined}
          />
        ) : (
          <p className="italic text-amber-600">No work data recorded.</p>
        )}
      </div>
    </div>
  );
}
