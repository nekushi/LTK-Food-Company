"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DUMMY_EMPLOYEES } from "./dummyData";
import type { EmployeeFormValues, EmployeeRow } from "./types";

const employeeSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  employeeId: z.string().min(1, "Required"),
  dateHired: z.string().min(1, "Required"),
  sss: z.string(),
  pagIbig: z.string(),
  philhealth: z.string(),
  tin: z.string(),
  contactNo: z.string(),
  email: z.string().min(1, "Required").email("Invalid email"),
  includeInPayroll: z.boolean(),
  linkAttendanceCard: z.boolean(),
});

const inputClass =
  "w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-amber-900 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500";
const labelClass = "mb-1 block text-sm font-medium text-amber-900";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function HREmployeesPage() {
  const [rows, setRows] = useState<EmployeeRow[]>(DUMMY_EMPLOYEES);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema) as Resolver<EmployeeFormValues>,
    defaultValues: {
      firstName: "",
      lastName: "",
      employeeId: "",
      dateHired: todayISO(),
      sss: "",
      pagIbig: "",
      philhealth: "",
      tin: "",
      contactNo: "",
      email: "",
      includeInPayroll: true,
      linkAttendanceCard: false,
    },
  });

  const onSubmit = (data: EmployeeFormValues) => {
    const row: EmployeeRow = {
      id: String(Date.now()),
      ...data,
    };
    setRows((prev) => [row, ...prev]);
    reset({
      ...data,
      firstName: "",
      lastName: "",
      employeeId: "",
      email: "",
      contactNo: "",
      sss: "",
      pagIbig: "",
      philhealth: "",
      tin: "",
      dateHired: todayISO(),
    });
  };

  return (
    <div className="space-y-6 p-8">
      <h1 className="text-xl font-semibold text-amber-900">Employees</h1>
      <p className="text-amber-800/80">
        Create employee, link attendance card (fingerprint biometrics). Use
        checkboxes to adjust payroll and attendance linking.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-xl border border-amber-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>First Name</label>
            <input
              type="text"
              {...register("firstName")}
              className={inputClass}
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-600">
                {errors.firstName.message}
              </p>
            )}
          </div>
          <div>
            <label className={labelClass}>Last Name</label>
            <input
              type="text"
              {...register("lastName")}
              className={inputClass}
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-red-600">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Employee ID</label>
            <input
              type="text"
              {...register("employeeId")}
              className={inputClass}
            />
            {errors.employeeId && (
              <p className="mt-1 text-xs text-red-600">
                {errors.employeeId.message}
              </p>
            )}
          </div>
          <div>
            <label className={labelClass}>Date hired (auto generated)</label>
            <input
              type="date"
              {...register("dateHired")}
              className={inputClass}
              onFocus={(e) => {
                if (!e.target.value) setValue("dateHired", todayISO());
              }}
            />
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>SSS</label>
            <input type="text" {...register("sss")} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>PagIbig</label>
            <input
              type="text"
              {...register("pagIbig")}
              className={inputClass}
            />
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Philhealth</label>
            <input
              type="text"
              {...register("philhealth")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>TIN</label>
            <input type="text" {...register("tin")} className={inputClass} />
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Contact No</label>
            <input
              type="text"
              {...register("contactNo")}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input type="email" {...register("email")} className={inputClass} />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-6 border-t border-amber-200 pt-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-amber-900">
            <input
              type="checkbox"
              {...register("includeInPayroll")}
              className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
            />
            Include in payroll
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-amber-900">
            <input
              type="checkbox"
              {...register("linkAttendanceCard")}
              className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
            />
            Link attendance card
          </label>
        </div>

        <button
          type="submit"
          className="mt-6 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          Add employee
        </button>
      </form>

      <div className="overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-max min-w-full table-auto text-left text-sm">
            <thead>
              <tr className="border-b border-amber-200 bg-amber-50">
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  First Name
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  Last Name
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  Employee ID
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  Date hired
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  SSS
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  PagIbig
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  Philhealth
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  TIN
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  Contact
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  Email
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  Payroll
                </th>
                <th className="whitespace-nowrap px-5 py-4 font-semibold text-amber-900">
                  Attendance
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-amber-100 hover:bg-amber-50/50"
                >
                  <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                    {row.firstName}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                    {row.lastName}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                    {row.employeeId}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                    {row.dateHired}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                    {row.sss || "—"}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                    {row.pagIbig || "—"}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                    {row.philhealth || "—"}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                    {row.tin || "—"}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                    {row.contactNo || "—"}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-amber-900">
                    {row.email}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3">
                    {row.includeInPayroll ? (
                      <span className="text-emerald-600">Yes</span>
                    ) : (
                      <span className="text-amber-600">No</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3">
                    {row.linkAttendanceCard ? (
                      <span className="text-emerald-600">Linked</span>
                    ) : (
                      <span className="text-amber-600">—</span>
                    )}
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
